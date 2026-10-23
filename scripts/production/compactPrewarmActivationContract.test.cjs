//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

/**
 * @file Production activation prewarm guarantees, inspected in the real shell.
 * The Awtsmoos bestows each byte upon the living, guarded gate;
 * Awtsmoos.com distinguishes deferred warmth from a successfully warmed state.
 */
const SCRIPT = path.join(__dirname, "canonical-server-activate.sh");

/** @returns {string} Exact canonical activation shell without substitutions. */
function revealActivationSource() {
	return fs.readFileSync(SCRIPT, "utf8");
}

/** Enabled prewarm must be guarded, required on disk, and rollback-armed. */
test("enabled prewarm requires its executable and fails before commit", () => {
	const source = revealActivationSource();
	const required = source.indexOf('for required in "$source_override"');
	const prewarmerInRequiredFiles = source.indexOf('"$compact_prewarmer"', required);
	const requiredFileCheck = source.indexOf('[ -f "$required" ] || fail', required);
	const execution = source.indexOf('node "$compact_prewarmer"');
	const commit = source.indexOf("committed=1");
	assert.ok(required >= 0);
	assert.ok(prewarmerInRequiredFiles > required);
	assert.ok(requiredFileCheck > prewarmerInRequiredFiles);
	assert.ok(execution > requiredFileCheck);
	assert.ok(commit > execution);
	assert.match(source, /AWTSMOOS_COMPACT_PREWARM:-0/);
	assert.match(source, /fail compact_prewarm_failed/);
});

/** Never label deferred warmup as prewarmed in the activation status. */
test("deferred prewarm has a truthful release status", () => {
	const source = revealActivationSource();
	assert.match(source, /compact prewarm deferred/);
	assert.match(source, /compact_status=deferred/);
	assert.match(source, /compact_status=prewarmed/);
	assert.match(source, /compact=%s tunnelBundle=preflight-passed/);
	assert.match(source, /"\$extension_artifact" "\$compact_status"/);
	assert.doesNotMatch(source, /SKIP.*PREWARM|PREWARM.*SKIP/i);
});

/** Both prewarm modes must check cleanliness before clearing rollback. */
test("post-prewarm Git cleanliness protects commit and rollback", () => {
	const source = revealActivationSource();
	const prewarm = source.indexOf('node "$compact_prewarmer"');
	const cleanliness = source.indexOf("post_prewarm_repo_dirty");
	const commit = source.indexOf("committed=1");
	assert.ok(prewarm >= 0);
	assert.ok(cleanliness > prewarm);
	assert.ok(commit > cleanliness);
	assert.match(source, /fail compact_prewarm_failed/);
});
