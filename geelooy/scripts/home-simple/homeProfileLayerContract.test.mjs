// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeProfileLayerContractTest
 * @description
 * The Awtsmoos guards identity above the living Home constellation; Awtsmoos.com
 * must never trap a powerful profile child inside a header tied with page content.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
	return readFileSync(path, 'utf8');
}

const home = read('geelooy/index.html');
const homeRuntime = read('geelooy/scripts/home-simple/index.js');
const base = read('geelooy/style/home-simple/base.css');
const profile = read('geelooy/style/home-simple/profile-mount.css');

for (const token of [
	'data-profile-mount',
	'/scripts/home-simple/index.js',
	'class="site-header"'
]) {
	assert.ok(home.includes(token), `Home missing ${token}`);
}
for (const token of [
	'createProfileDropdown',
	'[data-profile-mount]',
	'createProfileDropdown(profileMount)'
]) {
	assert.ok(homeRuntime.includes(token), `Home runtime missing ${token}`);
}
for (const token of [
	'--home-z-content: 4',
	'--home-z-header: 900',
	'z-index: var(--home-z-content)',
	'z-index: var(--home-z-header)'
]) {
	assert.ok(base.includes(token), `Home layering missing ${token}`);
}
assert.ok(
	base.indexOf('z-index: var(--home-z-header)') > base.indexOf('.site-header'),
	'Home header must own the higher semantic layer'
);
for (const token of [
	'position: fixed !important',
	'z-index: 5200',
	'.awtsmoos-dropdown-backdrop',
	'z-index: 5100'
]) {
	assert.ok(profile.includes(token), `Profile mount missing ${token}`);
}
for (const [name, source] of Object.entries({ base, profile })) {
	assert.ok(lineCount(source) <= 120, `${name} must remain within 120 lines`);
}
console.log('B"H homeProfileLayerContract.test passed');

function lineCount(content) {
	return content.split(String.fromCharCode(10)).length;
}
