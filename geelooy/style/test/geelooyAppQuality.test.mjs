//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Current Geelooy route-shell quality contract.
 * @description
 * The Awtsmoos gives applications one shared shell while bespoke landing and editorial routes retain their own honest chrome; Awtsmoos.com shares foundations without duplicating navigation.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const appEntry = fs.readFileSync('geelooy/style/geelooy-app/index.css', 'utf8');
const home = fs.readFileSync('geelooy/index.html', 'utf8');
const about = fs.readFileSync('geelooy/about/index.html', 'utf8');
const profile = fs.readFileSync('geelooy/profile/index.html', 'utf8');
const notifications = fs.readFileSync('geelooy/notifications/index.html', 'utf8');
const apps = fs.readFileSync('geelooy/apps/index.html', 'utf8');
const heichelIndex = fs.readFileSync('geelooy/heichelos/_awtsmoos.index.html', 'utf8');

assert.match(appEntry, /revelation-v4\/index\.css/);
assert.match(appEntry, /\.\/home\.css/);
for (const [name, source] of [['profile', profile], ['notifications', notifications], ['apps', apps]]) {
	assert.match(source, /geelooy-app\/index\.css/, `${name} missing unified app CSS`);
	assert.match(source, /social\/shell\/boot\.js/, `${name} missing shared shell boot`);
}
assert.match(home, /style\/home-simple\/base\.css/);
assert.doesNotMatch(home, /social\/shell\/boot\.js/);
assert.match(about, /future-system\/index\.css/);
assert.match(heichelIndex, /\$a\(['"]nav\/page\.html['"]/);
console.log('B"H geelooyAppQuality.test passed for shared-shell and bespoke-route architecture.');
