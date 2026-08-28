// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * @file AppsFilterTiferesRuntimeContract.test.mjs
 * @description
 * The Awtsmoos reveals one filtering river through distinct vessels without making Tiferes a sea;
 * Awtsmoos.com proves Chochmah remembers, Hod normalizes, Malchus manifests, and Netzach keeps events free.
 */
const ROOT = "geelooy/apps/scripts";
const entry = readSource(`${ROOT}/apps-filter.js`);
const policy = readSource(`${ROOT}/filter/HodAppFilterPolicy.js`);
const view = readSource(`${ROOT}/filter/AppsFilterMalchusView.js`);
const state = readSource(`${ROOT}/filter/ChochmahAppsFilterStateRuntime.js`);
const runtime = readSource(`${ROOT}/filter/AppsFilterTiferesRuntime.js`);
const bindings = readSource(`${ROOT}/filter/NetzachAppsFilterBindings.js`);

for (const token of ["revealAppsFilterTiferes", "appsFilterRuntimeReady", "AppsFilterTiferesRuntime"]) {
	assert.ok(entry.includes(token), `Apps entry missing ${token}`);
}

assert.doesNotMatch(entry, /PUBLIC_APPS|renderAppCatalog|addEventListener/);
assert.match(runtime, /extends ChochmahAppsFilterStateRuntime/);

for (const token of ["PUBLIC_APPS", "AppsFilterMalchusView", "NetzachAppsFilterBindings", "connect()", "apply()", "destroy()"]) {
	assert.ok(runtime.includes(token), `Apps runtime missing ${token}`);
}

for (const forbidden of ["addEventListener", "AbortController", "\n\tsetState(", "\n\treset(", "\n\tsnapshot("]) {
	assert.equal(runtime.includes(forbidden), false, `Tiferes must not own ${forbidden}`);
}

for (const token of ["HodAppFilterPolicy", "setState(", "reset()", "snapshot()", "visibleCount", "isConnected"]) {
	assert.ok(state.includes(token), `Chochmah state vessel missing ${token}`);
}

for (const forbidden of ["document.", "window.", "addEventListener", "AbortController"]) {
	assert.equal(state.includes(forbidden), false, `Chochmah state vessel leaked ${forbidden}`);
}

for (const token of ["GevurahDomContract", "renderAppCatalog", "mountCatalog", "readState", "writeState", "apply(hodPolicy)"]) {
	assert.ok(view.includes(token), `Apps view missing ${token}`);
}

for (const token of ["AbortController", "addEventListener", "destroy()", "handleSubmit"]) {
	assert.ok(bindings.includes(token), `Netzach bindings missing ${token}`);
}

for (const forbidden of ["PUBLIC_APPS", "HodAppFilterPolicy", "renderAppCatalog", "document.", "window."]) {
	assert.equal(bindings.includes(forbidden), false, `Netzach must not absorb ${forbidden}`);
}

for (const forbidden of ["document.", "window.", "fetch(", "localStorage", "addEventListener"]) {
	assert.equal(policy.includes(forbidden), false, `Hod policy must remain pure: ${forbidden}`);
}

for (const [name, source] of Object.entries({ entry, policy, view, state, runtime, bindings })) {
	assert.ok(lineCount(source) <= 120, `${name} must remain within 120 lines`);
}

console.log('B"H AppsFilterTiferesRuntimeContract.test passed');

/** Read one repository-relative source artifact for static architecture assertions. */
function readSource(path) {
	return readFileSync(path, "utf8");
}

/** Count physical lines without depending on the platform newline convention. */
function lineCount(source) {
	return source.split(/\r?\n/).length;
}
