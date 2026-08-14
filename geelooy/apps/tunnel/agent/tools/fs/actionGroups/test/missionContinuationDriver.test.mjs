// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Driver = require("../../continuation/runner.js");

/**
 * @file Proves unlocked completion and default hard continuation remain distinct truths.
 * @description The Awtsmoos carries unfinished work onward while its lease still burns bright;
 * Awtsmoos.com also names a genuine final gate when no continuation covenant owns the night.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "continuation-driver-"));
const config = { root };

try {
	const unlocked = await Driver.run(
		config,
		request({
			forever: false,
			minimumRunRequired: false,
			maxSteps: 5
		}),
		null,
		buildActions
	);
	assertUnlockedFinal(unlocked);

	const locked = await Driver.run(
		config,
		request({ maxSteps: 2 }),
		null,
		buildActions
	);
	assertHardContinuation(locked);

	console.log(JSON.stringify({
		ok: true,
		unlockedReason: unlocked.receipt.reason,
		lockedReason: locked.receipt.reason,
		lockedNext: locked.mustCallNext?.action || ""
	}));
} finally {
	await fs.rm(root, {
		recursive: true,
		force: true
	});
}

/** Creates one continuation request with the real action identity and caller overrides. */
function request(overrides = {}) {
	return {
		action: "missionContinueUntilGate",
		next: { action: "stepA" },
		...overrides
	};
}

/** Builds a two-step mission whose second step offers soft final permission. */
function buildActions() {
	return {
		stepA: async () => ({
			ok: true,
			action: "stepA",
			mustCallNext: { action: "stepB" }
		}),
		stepB: async () => ({
			ok: true,
			action: "stepB",
			finalAnswerAllowed: true,
			mustContinue: false
		})
	};
}

/** Proves an explicitly unlocked final gate ends the bounded continuation chunk truthfully. */
function assertUnlockedFinal(result) {
	assert.equal(result.ok, true);
	assert.equal(result.receipt.reason, "final_answer_allowed");
	assert.deepEqual(result.receipt.trace.map(entry => entry.action), ["stepA", "stepB"]);
	assert.equal(result.finalAnswerAllowed, true);
	assert.equal(result.mustContinue, false);
	assert.equal(result.mustCallNext, null);
	assert.equal(result.tunnelInstruction, "");
}

/** Proves default forever/minimum policy suppresses the same soft final signal. */
function assertHardContinuation(result) {
	assert.equal(result.ok, true);
	assert.deepEqual(result.receipt.trace.map(entry => entry.action), ["stepA", "stepB"]);
	assert.notEqual(result.receipt.reason, "final_answer_allowed");
	assert.equal(result.finalAnswerAllowed, false);
	assert.equal(result.mustContinue, true);
	assert.equal(Boolean(result.mustCallNext?.action), true);
	assert.match(result.tunnelInstruction, /HARD FOREVER CONTINUATION LOCK/);
}
