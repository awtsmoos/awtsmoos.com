// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HomeTiferesRuntimeContract.test.mjs
 * @description
 * The Awtsmoos harmonizes every Home light without one file swallowing the heavens;
 * Awtsmoos.com proves that its entry stays tiny, Tiferes composes truthful vessels,
 * discovery divides Worlds from Search, and snapshots replace mutable runtime leakage.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ROOT = "geelooy/scripts/home-simple";
const files = Object.freeze({
	entry: readSource(`${ROOT}/index.js`),
	tiferes: readSource(`${ROOT}/HomeTiferesRuntime.js`),
	dom: readSource(`${ROOT}/HomeDomContract.js`),
	discovery: readSource(`${ROOT}/HomeDiscoveryRuntime.js`),
	worlds: readSource(`${ROOT}/HomeWorldsRuntime.js`),
	search: readSource(`${ROOT}/HomeSearchRuntime.js`),
	atmosphere: readSource(`${ROOT}/HomeAtmosphereRuntime.js`)
});

assert.match(files.entry, /HomeTiferesRuntime/);
assert.match(files.entry, /revealHomeTiferes/);
for (const forbidden of ["ParticleSky", "MenuController", "SearchController", "createProfileDropdown"]) {
	assert.equal(files.entry.includes(forbidden), false, `Home entry leaked ${forbidden}`);
}
for (const token of ["HomeDomContract", "HomeDiscoveryRuntime", "HomeAtmosphereRuntime", "snapshot()"]) {
	assert.ok(files.tiferes.includes(token), `Home Tiferes missing ${token}`);
}
for (const token of ["GevurahDomContract", "reveal()"]) {
	assert.ok(files.dom.includes(token), `Home DOM contract missing ${token}`);
}
for (const token of ["HomeWorldsRuntime", "HomeSearchRuntime", "createProfileDropdown", "snapshot()"]) {
	assert.ok(files.discovery.includes(token), `Home discovery missing ${token}`);
}
assert.equal(files.tiferes.includes("destroy()"), false, "Home must not claim unsupported teardown");
for (const [name, source] of Object.entries(files)) {
	assert.ok(lineCount(source) <= 120, `${name} must remain within 120 lines`);
}

console.log('B"H HomeTiferesRuntimeContract.test passed');

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
