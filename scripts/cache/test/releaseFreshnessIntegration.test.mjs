// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

/**
 * @file Release freshness integration witness.
 * @description
 * The Awtsmoos joins source, release, and browser into one renewed chain;
 * Awtsmoos.com witnesses that no future ship may leave a stale build name.
 */

const shipSource = await readFile("scripts/ship.mjs", "utf8");
const releaseSource = await readFile("scripts/bhRelease.mjs", "utf8");
const rebbeBootSource = await readFile("geelooy/apps/rebbe/boot-entry.js", "utf8");

const shipStage = shipSource.indexOf('run("git", ["add", "-A"])');
const shipFreshness = shipSource.indexOf("await prepareReleaseFreshness()");
const shipCommit = shipSource.indexOf('run("git", ["commit"');
assert.ok(shipStage >= 0, "Ship must stage its intended release payload.");
assert.ok(shipFreshness > shipStage, "Ship must derive freshness after staging.");
assert.ok(shipCommit > shipFreshness, "Ship must stamp freshness before commit.");

const releaseGuard = releaseSource.indexOf("assertNoLooseWork(options.state)");
const releaseFreshness = releaseSource.indexOf("await prepareReleaseFreshness()");
const releaseCommit = releaseSource.indexOf('run("git", ["commit"');
assert.ok(releaseGuard >= 0, "Guarded release must reject loose work first.");
assert.ok(releaseFreshness > releaseGuard, "Guarded release must preserve staged-only safety.");
assert.ok(releaseCommit > releaseFreshness, "Guarded release must stamp before commit.");

const guardStart = rebbeBootSource.indexOf("startBuildVersionGuard()");
const mainImport = rebbeBootSource.indexOf("await import('./main.js')");
assert.ok(guardStart >= 0, "Rebbe must enroll in browser freshness monitoring.");
assert.ok(mainImport > guardStart, "Freshness monitoring must start before main.js.");

console.log('B"H releaseFreshnessIntegration.test passed');
