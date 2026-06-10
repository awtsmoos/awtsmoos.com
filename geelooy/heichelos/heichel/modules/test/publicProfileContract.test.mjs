// B"H
/**
 * Chapter 82: public profile contract now checks the split clean system.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const route = readFileSync('geelooy/@/_awtsmoos.derech.js', 'utf8');
const entry = readFileSync('geelooy/scripts/awtsmoos/social/profile/index.js', 'utf8');
const render = readFileSync('geelooy/scripts/awtsmoos/social/profile/render.js', 'utf8');
const api = readFileSync('geelooy/scripts/awtsmoos/social/profile/api.js', 'utf8');
const css = readFileSync('geelooy/style/social/profile/index.css', 'utf8');

for (const token of ['/style/social/profile/index.css', '/scripts/awtsmoos/social/profile/index.js']) assert.ok(route.includes(token), `route missing ${token}`);
for (const token of ['hydrateProfile', 'aliasFromPath']) assert.ok(entry.includes(token), `entry missing ${token}`);
for (const token of ['profile-app', 'profile-main', 'treeCard', 'commentCard', 'heichelCard', 'bottomNav']) assert.ok(render.includes(token), `render missing ${token}`);
for (const token of ['/api/social/profile/${encodeURIComponent(aliasId)}', 'saveProfile', 'saveTemplate']) assert.ok(api.includes(token), `api missing ${token}`);
for (const token of ['./tokens.css', './hero.css', './tree.css', './comments.css', './mobile.css']) assert.ok(css.includes(token), `css entry missing ${token}`);
assert.equal(existsSync('geelooy/style/social/public-profile.css'), false, 'old public-profile.css must be gone');
console.log('B"H publicProfileContract.test passed');
