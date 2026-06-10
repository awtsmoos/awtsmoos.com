// B"H
/**
 * Chapter 80: clean public profile UI contract.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const route = readFileSync('geelooy/@/_awtsmoos.derech.js', 'utf8');
const entry = readFileSync('geelooy/scripts/awtsmoos/social/profile/index.js', 'utf8');
const render = readFileSync('geelooy/scripts/awtsmoos/social/profile/render.js', 'utf8');
const api = readFileSync('geelooy/scripts/awtsmoos/social/profile/api.js', 'utf8');

assert.ok(route.includes('/style/social/profile/index.css'), 'route must load split css entry');
assert.ok(route.includes('/scripts/awtsmoos/social/profile/index.js'), 'route must load new profile entry');
assert.ok(entry.includes('hydrateProfile'), 'entry must hydrate profile');
assert.ok(api.includes('/api/social/profile/${encodeURIComponent(aliasId)}'), 'api must load aggregate profile');
for (const token of ['profile-app', 'profile-main', 'drawer', 'topbar', 'bottomNav', 'treeCard']) assert.ok(render.includes(token), `render missing ${token}`);
for (const oldFile of ['profileApi.js', 'profilePage.js', 'profileTree.js']) assert.equal(existsSync(`geelooy/scripts/awtsmoos/social/profile/${oldFile}`), false, `${oldFile} should not remain`);
console.log('B"H profileUiContract.test passed');
