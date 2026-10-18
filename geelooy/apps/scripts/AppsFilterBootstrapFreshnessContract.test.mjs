// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * @file Apps bootstrap freshness and recovery contract witness.
 * @description
 * The Awtsmoos joins current release-awareness with a second doorway after one failed import;
 * Awtsmoos.com proves the public Apps route no longer depends on one immortal module key.
 */

const bootstrapSource = await readFile(
	new URL("./apps-filter.v2.js", import.meta.url),
	"utf8"
);
const importerSource = await readFile(
	new URL("./AppsFilterRuntimeImporter.js", import.meta.url),
	"utf8"
);

for (const token of [
	"importAppsFilterRuntime",
	"startAppsBuildFreshness",
	"appsFilterRuntimeReady",
	"AppsFilterBootMalchusView"
]) {
	assert.ok(bootstrapSource.includes(token), `Apps bootstrap missing ${token}`);
}

assert.match(bootstrapSource, /BuildVersionGuard\.js\?v=apps-freshness-001/);
assert.doesNotMatch(bootstrapSource, /apps-runtime-005/);
assert.match(importerSource, /apps-runtime-006/);
assert.match(importerSource, /recovery=/);
assert.match(importerSource, /AggregateError/);

const guardStart = bootstrapSource.indexOf("startAppsBuildFreshness()");
const readyExport = bootstrapSource.indexOf("appsFilterRuntimeReady");
assert.ok(guardStart >= 0, "Apps bootstrap must start freshness monitoring.");
assert.ok(readyExport > guardStart, "Freshness enrollment must begin before route readiness settles.");

for (const [name, source] of Object.entries({ bootstrapSource, importerSource })) {
	assert.ok(source.split(/\r?\n/).length <= 120, `${name} must remain within 120 lines`);
}

console.log('B"H AppsFilterBootstrapFreshnessContract.test passed');
