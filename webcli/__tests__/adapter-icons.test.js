import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validatePackageFiles, readPackageDirectory, writePackageDirectory } from '../adapter-package-files.js';
import { validateV2AdapterDir } from '../adapter-package-validation.js';

const roots = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#2563eb"/></svg>';
function files() {
  return new Map([
    ['manifest.json', JSON.stringify({ schema_version: 2, name: 'demo', version: '1.0.0', description: 'Fixture', match: ['example.com'],
      commands: [{ id: 'list', runtime: 'extension', module: 'extension/commands/list.js', description: 'List', schema: { type: 'object' } }] })],
    ['extension/commands/list.js', 'export default () => [];'],
  ]);
}

it('preserves root icons through package validation, copying and content digests', () => {
  const original = files();
  const baseDigest = validatePackageFiles(original).digest;
  original.set('icon.svg', svg);
  const pkg = validatePackageFiles(original);
  expect(pkg.digest).not.toBe(baseDigest);
  const root = mkdtempSync(join(tmpdir(), 'adapter-icons-'));
  roots.push(root);
  const target = join(root, 'demo');
  writePackageDirectory(target, original);
  expect(validateV2AdapterDir(target).name).toBe('demo');
  expect(readPackageDirectory(target).files.get('icon.svg').toString()).toBe(svg);
  expect(readPackageDirectory(target).digest).toBe(pkg.digest);
  original.set('icon.svg', svg.replace('#2563eb', '#0f766e'));
  expect(validatePackageFiles(original).digest).not.toBe(pkg.digest);
});

it.each([
  ['icon.svg', svg.replace('</svg>', '<script>alert(1)</script></svg>')],
  ['icon.svg', svg.replace('</svg>', '<image href="https://example.com/a.png"/></svg>')],
  ['icon.svg', '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject/></svg>'],
  ['icon.svg', '<svg onload="alert(1)"/>'],
  ['icon.svg', 'x'.repeat(512 * 1024 + 1)],
  ['icon.png', '<svg/>'],
  ['logo.svg', svg],
])('rejects invalid or unexpected root images (%s)', (name, bytes) => {
  const pkg = files();
  pkg.set(name, bytes);
  expect(() => validatePackageFiles(pkg)).toThrow();
});

it('does not treat a directory named icon.svg as an image', () => {
  const root = mkdtempSync(join(tmpdir(), 'adapter-icons-'));
  roots.push(root);
  const target = join(root, 'demo');
  writePackageDirectory(target, files());
  mkdirSync(join(target, 'icon.svg'));
  expect(() => validateV2AdapterDir(target)).toThrow(/regular file/);
  expect(() => readPackageDirectory(target)).toThrow(/directory/);
});
