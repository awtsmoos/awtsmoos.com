// B"H
// Boruch Hashem
// Blessed is He
/** @module ReleaseInventoryTest @description Verifies Git parsing, quoted paths, evidence, and explicit train routing. */
import assert from 'node:assert/strict';
import {
	assignReleaseTrain,
	buildReleaseInventory,
	parseStatusLine
} from '../tools/releaseInventory.mjs';

const modified = parseStatusLine(' M geelooy/social-composer/js/app.js');
assert.equal(modified.trainId, 'social');
assert.equal(modified.staged, false);
assert.equal(modified.artifactKind, 'source');
const untracked = parseStatusLine('?? geelooy/games/mitzvahWorld/evidence/frame.png');
assert.equal(untracked.trainId, 'replays');
assert.equal(untracked.untracked, true);
assert.equal(untracked.artifactKind, 'evidence');
const renamed = parseStatusLine('R  old.js -> geelooy/apps/android-emulator/new.js');
assert.equal(renamed.trainId, 'artifacts');
assert.equal(renamed.staged, true);
const bundleTest = parseStatusLine('?? geelooy/os/test/applicationBundleOpen.test.mjs');
assert.equal(bundleTest.trainId, 'artifacts');
assert.equal(bundleTest.artifactKind, 'test');
const quoted = parseStatusLine('?? "geelooy/games/sefira-clash/.reports/frontier marker.txt"');
assert.equal(quoted.path, 'geelooy/games/sefira-clash/.reports/frontier marker.txt');
assert.equal(quoted.trainId, 'replays');
assert.equal(quoted.artifactKind, 'evidence');
const simulator = parseStatusLine('?? geelooy/games/scribe-journey/tests/simulator-results/run/summary.json');
assert.equal(simulator.trainId, 'characters');
assert.equal(simulator.artifactKind, 'evidence');
assert.equal(assignReleaseTrain('unknown/new.js'), 'unrouted');
const inventory = buildReleaseInventory([
	' M geelooy/social-composer/js/app.js',
	'?? geelooy/games/mitzvahWorld/evidence/frame.png',
	'D  unknown/old.js'
].join('\n'), { head: 'abc', createdAt: 'now' });
assert.equal(inventory.total, 3);
assert.equal(inventory.staged, 1);
assert.equal(inventory.untracked, 1);
assert.equal(inventory.deleted, 1);
assert.equal(inventory.trains.social.entries.length, 1);
assert.equal(inventory.trains.unrouted.entries.length, 1);
console.log('B"H release inventory passed.');
