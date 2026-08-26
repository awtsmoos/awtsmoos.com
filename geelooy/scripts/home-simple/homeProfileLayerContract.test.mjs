// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file homeProfileLayerContract.test.mjs
 * @description
 * The Awtsmoos guards identity above the living Home constellation; Awtsmoos.com
 * now proves both visual layer truth and architectural ownership: the entry begins
 * Tiferes, the DOM contract locates the mount, and Discovery alone creates identity.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readSource("geelooy/index.html");
const homeEntry = readSource("geelooy/scripts/home-simple/index.js");
const homeDom = readSource("geelooy/scripts/home-simple/HomeDomContract.js");
const discovery = readSource("geelooy/scripts/home-simple/HomeDiscoveryRuntime.js");
const base = readSource("geelooy/style/home-simple/base.css");
const profile = readSource("geelooy/style/home-simple/profile-mount.css");

for (const token of ["data-profile-mount", "/scripts/home-simple/index.js", 'class="site-header"']) {
	assert.ok(home.includes(token), `Home missing ${token}`);
}
for (const token of ["HomeTiferesRuntime", "revealHomeTiferes"]) {
	assert.ok(homeEntry.includes(token), `Home entry missing ${token}`);
}
assert.ok(homeDom.includes('[data-profile-mount]'), "Home DOM contract must own the profile selector");
for (const token of ["createProfileDropdown", "this.homeKelim.profileMount"]) {
	assert.ok(discovery.includes(token), `Home discovery missing ${token}`);
}
for (const token of ["--home-z-content: 4", "--home-z-header: 900", "z-index: var(--home-z-content)", "z-index: var(--home-z-header)"]) {
	assert.ok(base.includes(token), `Home layering missing ${token}`);
}
assert.ok(
	base.indexOf("z-index: var(--home-z-header)") > base.indexOf(".site-header"),
	"Home header must own the higher semantic layer"
);
for (const token of ["position: fixed !important", "z-index: 5200", ".awtsmoos-dropdown-backdrop", "z-index: 5100"]) {
	assert.ok(profile.includes(token), `Profile mount missing ${token}`);
}
for (const [name, source] of Object.entries({ base, profile })) {
	assert.ok(lineCount(source) <= 120, `${name} must remain within 120 lines`);
}

console.log('B"H homeProfileLayerContract.test passed');

/**
 * @param {string} path Repository-relative source path.
 * @returns {string} UTF-8 source text.
 */
function readSource(path) {
	return readFileSync(path, "utf8");
}

/**
 * @param {string} source Source text.
 * @returns {number} Physical line count.
 */
function lineCount(source) {
	return source.split(/\r?\n/).length;
}
