//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives every route one shell law instead of overlapping chrome. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const profile = read('geelooy/profile/index.html');
const notifications = read('geelooy/notifications/index.html');
const apps = read('geelooy/apps/index.html');
const about = read('geelooy/about/index.html');
const login = read('geelooy/login/index.html');
const heichelDirectory = read('geelooy/heichelos/_awtsmoos.index.html');
const reader = read('geelooy/heichelos/post/_awtsmoos.post.html');

for (const [name, source] of [['profile', profile], ['notifications', notifications], ['apps', apps]]) {
	assert.match(source, /geelooy-app\/index\.css/, `${name} must inherit the shared app foundation`);
	assert.equal((source.match(/social\/shell\/boot\.js/g) || []).length, 1, `${name} must boot one shared shell`);
}
assert.doesNotMatch(about, /social\/shell\/boot\.js/, 'about remains bespoke editorial chrome');
assert.doesNotMatch(login, /social\/shell\/boot\.js/, 'login remains a focused auth gate');
assert.match(login, /login\/styles\/index\.css/);
assert.match(heichelDirectory, /nav\/page\.html/, 'directory inherits the server navigation shell');
assert.doesNotMatch(reader, /social\/shell\/boot\.js/, 'reader remains bespoke reader chrome');
console.log('B"H remainingRouteOwnership.test passed.');
