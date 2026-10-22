import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { assertManagedDirectory, assertManagedFile } from './adapter-package-files.js';
import { syncManagedAdapterSkills } from './adapter-skill-sync.js';

/**
 * Rebuilds WeWorker-owned runtime Skills during `webcli install --skills`.
 *
 * `webcli` and bundled `webcli-*` folders are reserved for packaged shared
 * Skills. Adapter folders are reserved only when their exact adapter ID is
 * known by the current managed catalog; other user folders are untouched.
 */
export function isReservedBundledSkillName(name) {
  return name === 'webcli' || name.startsWith('webcli-');
}

function replaceBundledSkillDirectory(target, source, name) {
  const destination = join(target, name);
  assertManagedDirectory(destination);
  if (existsSync(destination)) rmSync(destination, { recursive: true, force: true });
  cpSync(join(source, name), destination, { recursive: true, dereference: false });
}

function removeDisabledSkillFile(target, adapterId) {
  const directory = join(target, `webcli-${adapterId}`);
  assertManagedDirectory(directory);
  if (!existsSync(directory)) return;
  const disabled = assertManagedFile(directory, 'SKILL.md.disabled');
  if (existsSync(disabled)) rmSync(disabled, { force: true });
}

/**
 * Install all WeWorker-owned runtime Skills into a target directory.
 *
 * This deliberately overwrites generated Adapter Skill content for exact
 * catalog-managed IDs so legacy pre-marker Skills are upgraded. It never
 * selects arbitrary `webcli-*` folders: only catalog-managed Adapter IDs and
 * bundled shared Skill names are replaced.
 */
export function installManagedRuntimeSkills({ target, snapshot, profile, bundledSkillsDir, adapterId = null }) {
  assertManagedDirectory(target);
  mkdirSync(target, { recursive: true });

  if (!adapterId && existsSync(bundledSkillsDir)) {
    for (const entry of readdirSync(bundledSkillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !isReservedBundledSkillName(entry.name)) continue;
      replaceBundledSkillDirectory(target, bundledSkillsDir, entry.name);
    }
  }

  const managedNames = snapshot.managedNames instanceof Set
    ? snapshot.managedNames
    : new Set(snapshot.managedNames || []);
  for (const name of managedNames) {
    if (adapterId && name !== adapterId) continue;
    removeDisabledSkillFile(target, name);
  }

  return syncManagedAdapterSkills({
    target,
    snapshot,
    profile,
    adapterId,
    overwrite: true,
  });
}
