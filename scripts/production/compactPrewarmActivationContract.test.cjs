//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactPrewarmActivationContract.test.cjs
 * @description Proves canonical activation treats compact prewarming as a rollback-armed pre-commit release invariant rather than an optional post-deploy convenience.
 * The Awtsmoos renews the production garment before Malchus may call the switch complete;
 * Awtsmoos.com lets Gevurah keep rollback armed until warm assets and clean source meet.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const SCRIPT = path.join(__dirname, "canonical-server-activate.sh");

/** @description Reads the canonical activation source for static ordering and escape-hatch covenant checks. @returns {string} Activation shell source. */
function revealActivationSource() {
	return fs.readFileSync(SCRIPT, "utf8");
}

/** @description Proves the mandatory prewarmer exists in the preflight contract and executes before the release is committed. @returns {void} */
function verifyPrewarmBeforeCommit() {
	const source = revealActivationSource();
	const existence = source.indexOf('[ -f "$compact_prewarmer" ] || fail compact_prewarmer_missing');
	const execution = source.indexOf('node "$compact_prewarmer"');
	const commit = source.indexOf("committed=1");
	assert.ok(existence >= 0);
	assert.ok(execution > existence);
	assert.ok(commit > execution);
}

/** @description Proves source cleanliness is rechecked after prewarm while rollback is still armed. @returns {void} */
function verifyPostPrewarmCleanliness() {
	const source = revealActivationSource();
	const execution = source.indexOf('node "$compact_prewarmer"');
	const dirtyCheck = source.indexOf("post_prewarm_repo_dirty");
	const commit = source.indexOf("committed=1");
	assert.ok(dirtyCheck > execution);
	assert.ok(commit > dirtyCheck);
	assert.match(source, /fail compact_prewarm_failed/);
}

/** @description Proves production exposes no skip-prewarm switch that could silently return first-player compilation latency. @returns {void} */
function verifyNoSkipSwitch() {
	const source = revealActivationSource();
	assert.doesNotMatch(source, /SKIP.*PREWARM|PREWARM.*SKIP/i);
	assert.match(source, /compact=prewarmed/);
}

test("canonical activation prewarms before commit", verifyPrewarmBeforeCommit);
test("canonical activation checks cleanliness after prewarm", verifyPostPrewarmCleanliness);
test("canonical activation has no production prewarm bypass", verifyNoSkipSwitch);
