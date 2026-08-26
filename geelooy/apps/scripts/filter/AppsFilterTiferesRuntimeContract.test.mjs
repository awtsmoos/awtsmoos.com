// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AppsFilterTiferesRuntimeContract.test.mjs
 * @description
 * The Awtsmoos joins policy and manifestation without confusing their garments;
 * Awtsmoos.com proves that Apps keeps Hod pure, Malchus local, Tiferes abortable,
 * and the browser doorway small enough for CompactJS to fold the modular river.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ROOT = "geelooy/apps/scripts";
const entry = readSource(`${ROOT}/apps-filter.js`);
const policy = readSource(`${ROOT}/filter/HodAppFilterPolicy.js`);
const view = readSource(`${ROOT}/filter/AppsFilterMalchusView.js`);
const runtime = readSource(`${ROOT}/filter/AppsFilterTiferesRuntime.js`);

assert.match(entry, /AppsFilterTiferesRuntime/);
assert.doesNotMatch(entry, /PUBLIC_APPS|renderAppCatalog|addEventListener/);

for (const token of ["PUBLIC_APPS", "AppsFilterMalchusView", "HodAppFilterPolicy", "AbortController", "destroy()", "snapshot()"]) {
	assert.ok(runtime.includes(token), `Apps runtime missing ${token}`);
}
for (const token of ["GevurahDomContract", "renderAppCatalog", "mountCatalog", "readState", "apply(hodPolicy)"]) {
	assert.ok(view.includes(token), `Apps view missing ${token}`);
}
for (const forbidden of ["document.", "window.", "fetch(", "localStorage", "addEventListener"]) {
	assert.equal(policy.includes(forbidden), false, `Hod policy must remain pure: ${forbidden}`);
}
for (const [name, source] of Object.entries({ entry, policy, view, runtime })) {
	assert.ok(lineCount(source) <= 120, `${name} must remain within 120 lines`);
}

console.log('B"H AppsFilterTiferesRuntimeContract.test passed');

/**
 * Reads a source artifact for static architecture assertions.
 *
 * @param {string} path Repository-relative source path.
 * @returns {string} UTF-8 source text.
 */
function readSource(path) {
	return readFileSync(path, "utf8");
}

/**
 * Counts physical source lines without depending on platform newline conventions.
 *
 * @param {string} source Source text.
 * @returns {number} Physical line count.
 */
function lineCount(source) {
	return source.split(/\r?\n/).length;
}
