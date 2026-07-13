// B"H
const fs = require("node:fs");
const path = require("node:path");
const Selector = require("./candidateSelector.js");

/**
 * B"H — Restoration searches actual versions newest to oldest. The displaced
 * runtime remains preserved after success, giving Awtsmoos.com one more return
 * path until a later bounded cleanup explicitly releases it.
 */
function restore(root, tier, recoveryRoot) {
	const liveRoot = path.resolve(root);
	const storeRoot = path.resolve(recoveryRoot || `${liveRoot}-recovery`);
	const stamp = Date.now();
	const stageRoot = `${liveRoot}.recovery-stage-${stamp}`;
	const rollbackRoot = `${liveRoot}.recovery-rollback-${stamp}`;
	const configPath = path.join(liveRoot, "config.json");
	const selection = Selector.select({ recoveryRoot: storeRoot, stageRoot, configPath });
	if (!selection.ok) return { ...selection, tier, recoveryRoot: storeRoot };

	let movedLive = false;
	try {
		if (fs.existsSync(liveRoot)) {
			fs.renameSync(liveRoot, rollbackRoot);
			movedLive = true;
		}
		fs.renameSync(stageRoot, liveRoot);
		fs.rmSync(path.join(liveRoot, "recovery-state.json"), { force: true });
		return {
			ok: true,
			tier,
			version: selection.candidate.version,
			candidate: selection.candidate.directory || selection.candidate.archivePath,
			rollbackRoot: movedLive ? rollbackRoot : "",
			attempts: selection.attempts
		};
	} catch (error) {
		if (movedLive && !fs.existsSync(liveRoot) && fs.existsSync(rollbackRoot)) {
			fs.renameSync(rollbackRoot, liveRoot);
		}
		return { ok: false, error: error.message, attempts: selection.attempts };
	} finally {
		fs.rmSync(stageRoot, { recursive: true, force: true });
	}
}

module.exports = { restore };
