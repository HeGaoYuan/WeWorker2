import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { ADAPTER_ICON_FILES, validateAdapterIcon, validateAgentGuidance, validateV2Manifest } from './adapter-package-validation.js';
import { assertUiWriteModule } from './exploration-ui-write.js';
import { assertPageWriteModule } from './exploration-extension-write.js';

export function adapterError(code, message) {
  return Object.assign(new Error(message), { code });
}

export function assertPackagePath(name) {
  if (typeof name !== 'string' || !name || name.startsWith('/') || name.includes('\\')
    || name.split('/').some((part) => !part || part === '.' || part === '..'
      || /[\x00-\x1f\x7f:*?"<>|]/.test(part) || /[. ]$/.test(part)
      || /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part))) {
    throw adapterError('INVALID_PACKAGE_PATH', 'Invalid Adapter package path.');
  }
  return name;
}

export function assertManagedDirectory(root) {
  if (existsSync(root)) {
    const stat = lstatSync(root);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw adapterError('UNSAFE_ADAPTER_DIRECTORY', 'Adapter directory must be a regular directory.');
    }
  }
}

export function assertManagedFile(root, name) {
  assertPackagePath(name);
  assertManagedDirectory(root);
  let current = resolve(root);
  for (const part of name.split('/')) {
    current = join(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) {
      throw adapterError('UNSAFE_ADAPTER_FILE', 'Adapter file path contains a symbolic link or junction.');
    }
  }
  if (existsSync(current)) {
    const base = realpathSync(root);
    const actual = realpathSync(current);
    const rel = relative(base, actual);
    if (rel === '..' || rel.startsWith('..' + sep) || resolve(base, rel) !== actual) {
      throw adapterError('UNSAFE_ADAPTER_FILE', 'Adapter file escaped its managed directory.');
    }
  }
  return current;
}

export function validatePackageFiles(input) {
  if (!(input instanceof Map) || !input.size || input.size > 512) {
    throw adapterError('INVALID_PACKAGE', 'Adapter package must contain 1 to 512 files.');
  }
  const files = new Map();
  const names = new Set();
  let size = 0;
  for (const [name, contents] of input) {
    assertPackagePath(name);
    if (names.has(name.toLowerCase())) throw adapterError('INVALID_PACKAGE', 'Case-insensitive file collision.');
    names.add(name.toLowerCase());
    if (!Buffer.isBuffer(contents) && !(contents instanceof Uint8Array) && typeof contents !== 'string') {
      throw adapterError('INVALID_PACKAGE', 'Invalid Adapter file contents.');
    }
    const bytes = Buffer.from(contents);
    size += bytes.length;
    if (size > 32 * 1024 * 1024) throw adapterError('INVALID_PACKAGE', 'Adapter package exceeds 32 MiB.');
    files.set(name, bytes);
  }
  let manifest;
  try { manifest = JSON.parse(files.get('manifest.json')?.toString('utf8')); }
  catch { throw adapterError('INVALID_PACKAGE', 'Adapter manifest is missing or invalid.'); }
  const validated = validateV2Manifest(manifest, manifest?.name);
  for (const command of validated.commands) { assertPageWriteModule(command, files); assertUiWriteModule(command, files); }
  const guidanceBytes = files.get('guidance.md');
  if (guidanceBytes) {
    try { validateAgentGuidance(guidanceBytes); }
    catch (error) { throw adapterError('INVALID_PACKAGE', error.message); }
  }
  const runtimes = new Set(validated.commands.map((command) => command.runtime));
  const commands = new Set(validated.commands.map((command) => command.module));
  for (const command of commands) if (!files.has(command)) throw adapterError('INVALID_PACKAGE', 'Adapter command module is missing.');
  for (const name of files.keys()) {
    if (name === 'manifest.json' || name === 'guidance.md') continue;
    if (ADAPTER_ICON_FILES.includes(name)) {
      try { validateAdapterIcon(name, files.get(name)); }
      catch (error) { throw adapterError('INVALID_PACKAGE', error.message); }
      continue;
    }
    const [runtime, folder, ...rest] = name.split('/');
    if (!runtimes.has(runtime) || !['commands', 'internal'].includes(folder) || !rest.length
      || (folder === 'commands' && !commands.has(name))
      || /(?:^|\/)(?:SKILL(?:\.generated)?\.md|index\.js|toolkit_runtime\.py|toolkit\.py|requirements\.txt|WEBCLI_KNOWLEDGE\.[^/]+|wecli\.generated\.json|__pycache__)(?:\/|$)/.test(name)
      || /\.generated\.(?:js|py|md|txt)$/.test(name)) {
      throw adapterError('INVALID_PACKAGE', 'Unexpected Adapter package file: ' + name);
    }
  }
  const hash = createHash('sha256');
  for (const name of [...files.keys()].sort()) {
    const bytes = files.get(name);
    hash.update(name).update('\0').update(String(bytes.length)).update('\0').update(bytes);
  }
  return { ...validated, files, digest: hash.digest('hex'), expandedBytes: size };
}

export function readPackageDirectory(root) {
  assertManagedDirectory(root);
  const files = new Map();
  const directories = [];
  let size = 0;
  function visit(dir, prefix = '') {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const name = prefix + item.name;
      assertPackagePath(name);
      const file = join(dir, item.name);
      // Walk only regular directories from the checked root, without resolving
      // every ancestor again for every file (costly on Windows).
      if (item.isSymbolicLink()) throw adapterError('INVALID_PACKAGE', 'Links are not allowed in Adapter packages.');
      if (item.isDirectory()) {
        directories.push(name);
        if (directories.length > 512 || name.split('/').length > 32) throw adapterError('INVALID_PACKAGE', 'Adapter directory limit exceeded.');
        visit(file, name + '/');
      }
      else if (item.isFile()) {
        size += lstatSync(file).size;
        if (files.size >= 512 || size > 32 * 1024 * 1024) throw adapterError('INVALID_PACKAGE', 'Adapter package size limit exceeded.');
        files.set(name, readFileSync(file));
      } else throw adapterError('INVALID_PACKAGE', 'Adapter package must contain regular files.');
    }
  }
  visit(root);
  const pkg = validatePackageFiles(files);
  validateV2Manifest(pkg.manifest, basename(resolve(root)));
  const runtimes = new Set(pkg.commands.map((command) => command.runtime));
  for (const directory of directories) {
    const [runtime, kind, ...nested] = directory.split('/');
    if (!runtimes.has(runtime) || (kind && !['commands', 'internal'].includes(kind)) || (kind === 'commands' && nested.length)) {
      throw adapterError('INVALID_PACKAGE', 'Unexpected Adapter package directory.');
    }
  }
  return { ...pkg, root: resolve(root) };
}

export function writePackageDirectory(root, files) {
  const pkg = validatePackageFiles(files);
  assertManagedDirectory(root);
  mkdirSync(root, { recursive: true });
  for (const [name, contents] of pkg.files) {
    const file = assertManagedFile(root, name);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, contents, { flag: 'wx' });
  }
  return readPackageDirectory(root);
}
