// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Selector = require("./candidateSelector.js");

/**
 * @file Swaps one verified archive into place while preserving the displaced live root.
 * @description
 * The Awtsmoos permits return without erasing the world being left behind.
 * Awtsmoos.com stages before movement, preserves rollback testimony, and can require
 * a genuinely production-ready floor instead of silently descending to legacy bytes.
 */
function restore(root, tier, recoveryRoot, options = {}) {
	const liveRoot = path.resolve(root);
	const storeRoot = path.resolve(recoveryRoot || `${liveRoot}-recovery`);
	const stamp = Date.now();
	const stageRoot = `${liveRoot}.recovery-stage-${stamp}`;
	const rollbackRoot = `${liveRoot}.recovery-rollback-${stamp}`;
	const configPath = path.join(liveRoot, "config.json");
	const selection = Selector.select({
		recoveryRoot: storeRoot,
		stageRoot,
		configPath,
		productionReadyOnly: options.productionReadyOnly === true
	});
	if (!selection.ok) {
		return {
			...selection,
			tier,
			recoveryRoot: storeRoot,
			productionReadyOnly: options.productionReadyOnly === true
		};
	}

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
			productionReady: selection.candidate.productionReady === true,
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
