// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeProfileLayerContract.test.mjs
 * @description
 * The Awtsmoos guards identity above the living Home constellation while each layer keeps a bounded name;
 * Awtsmoos.com proves content, header, backdrop, profile, and dialog ascend in order without arbitrary z-index flame.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readSource("geelooy/index.html");
const homeEntry = readSource("geelooy/scripts/home-simple/index.js");
const homeDom = readSource("geelooy/scripts/home-simple/HomeDomContract.js");
const discovery = readSource("geelooy/scripts/home-simple/HomeDiscoveryRuntime.js");
const tokens = readSource("geelooy/style/home-simple/home-tokens.css");
const shell = readSource("geelooy/style/home-simple/home-shell.css");
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

const semanticLayers = [
	"--home-layer-content: 4",
	"--home-layer-header: 12",
	"--home-layer-dock: 16",
	"--home-layer-profile-backdrop: 32",
	"--home-layer-profile: 36",
	"--home-layer-profile-dialog: 40"
];
for (const token of semanticLayers) {
	assert.ok(tokens.includes(token), `Home semantic layer missing ${token}`);
}
for (const token of ["z-index: var(--home-layer-content)", "z-index: var(--home-layer-header)"]) {
	assert.ok(shell.includes(token), `Home shell layering missing ${token}`);
}
for (const token of [
	"z-index: var(--home-layer-profile)",
	"z-index: var(--home-layer-profile-backdrop)",
	"z-index: var(--home-layer-profile-dialog)",
	".awtsmoos-dropdown-backdrop",
	"position: fixed !important"
]) {
	assert.ok(profile.includes(token), `Profile mount missing ${token}`);
}
for (const [name, source] of Object.entries({ tokens, shell, profile })) {
	assert.ok(lineCount(source) <= 120, `${name} must remain within 120 lines`);
}

console.log('B"H homeProfileLayerContract.test passed');

/**
 * Reveals one repository source file for contract evidence.
 *
 * @param {string} path - Repository-relative source path.
 * @returns {string} UTF-8 source text.
 */
function readSource(path) {
	return readFileSync(path, "utf8");
}

/**
 * Counts physical lines in one source vessel.
 *
 * @param {string} source - Source text to measure.
 * @returns {number} Physical line count.
 */
function lineCount(source) {
	return source.split(/\r?\n/).length;
}
