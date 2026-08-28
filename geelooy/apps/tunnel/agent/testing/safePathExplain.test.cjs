// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildCognitionActions } = require("../tools/fs/actionGroups/cognitionActions.js");

/**
 * @file Proves safePathExplain speaks structured filesystem truth without silencing generic cognition.
 * @description
 * The Awtsmoos gives each action its vessel and each vessel its voice;
 * Awtsmoos.com keeps old cognition alive while safe paths gain a precise choice.
 */

/**
 * @description Exercises explicit, compatibility, default, and generic cognition routing.
 * @returns {Promise<void>} Resolves after all cognition contracts are verified.
 * @throws {Error} When a specialized or historical routing contract regresses.
 * @sideEffects Creates and removes one temporary directory tree.
 */
async function runSafePathExplainTests() {
	const chesedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-path-action-"));
	try {
		fs.writeFileSync(path.join(chesedRoot, "truth.txt"), "B\"H\n", "utf8");
		for (const chochmahPayload of [
			{ path: "truth.txt" },
			{ p: "truth.txt" },
			{ target: "truth.txt" }
		]) {
			const malchusActions = buildCognitionActions({
				config: { root: chesedRoot },
				payload: chochmahPayload
			});
			const tiferesResult = await malchusActions.safePathExplain();
			assert.equal(tiferesResult.action, "safePathExplain");
			assert.equal(tiferesResult.result.type, "absolute-path-record");
			assert.equal(tiferesResult.result.exists, true);
			assert.equal(tiferesResult.result.source, "explicit-user-path");
			assert.match(tiferesResult.result.display, /^ABSOLUTE=/);
		}
		const yesodDefaultActions = buildCognitionActions({
			config: { root: chesedRoot },
			payload: {}
		});
		const hodDefaultResult = await yesodDefaultActions.safePathExplain();
		assert.equal(hodDefaultResult.result.projectRelativePath, ".");
		assert.equal(hodDefaultResult.result.source, "filesystem-discovery");
		const netzachGenericActions = buildCognitionActions({
			config: { root: process.cwd() },
			payload: { p: "." }
		});
		const binahGenericResult = await netzachGenericActions.architectureScore();
		assert.equal(binahGenericResult.result.type, "cognition-report");
		console.log(JSON.stringify({ ok: true, test: "safePathExplain" }, null, 2));
	} finally {
		fs.rmSync(chesedRoot, { recursive: true, force: true });
	}
}

runSafePathExplainTests().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
