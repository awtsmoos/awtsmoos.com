// B"H
import assert from 'node:assert/strict';

const { ACTION_CATALOG } = await import('../actionCatalogData.js');

const expectedVfsActions = [
  'vfsWrite',
  'vfsMkdir',
  'vfsRemove',
  'vfsCan',
  'vfsMounts',
  'vfsResolve'
];

for (const name of expectedVfsActions) {
  const entry = ACTION_CATALOG.find(action => action.name === name);
  assert(entry, `${name} should be exposed in the action catalog`);
  assert.equal(entry.group, 'Virtual OS', `${name} should stay with Virtual OS gates`);
  assert(entry.badges.includes('vfs'), `${name} should carry the vfs badge`);
}

const names = ACTION_CATALOG.map(action => action.name);
assert.equal(new Set(names).size, names.length, 'action catalog names should be unique');

/**
 * B"H
 * The test is a small watchman: if the VFS gates vanish from the public
 * catalog, it cries out before the control surface forgets its own doorway.
 */
