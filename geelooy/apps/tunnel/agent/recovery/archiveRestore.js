// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const Integrity = require("./integrity.js");
const State = require("./stateStore.js");
const Tiers = require("./tierCatalog.js");

/**
 * B"H
 * Restoration replaces a broken vessel from an immutable external archive.
 * The Awtsmoos lets Awtsmoos.com preserve config and recovery memory while the
 * executable tree returns atomically to the last validated rung.
 */
function restore(root, rawTier, options = {}) {
	const tier = Tiers.normalize(rawTier);
	const recoveryRoot = options.recoveryRoot ||
		process.env.AWTSMOOS_RECOVERY_ROOT ||
		`${root}-recovery`;
	const packageRoot = path.join(recoveryRoot, "tiers", `level-${tier}`);
	const archive = path.join(packageRoot, "runtime.tar");
	if (!fs.existsSync(archive)) {
		return failure("recovery_archive_missing", { tier, archive });
	}
	const stage = `${root}.restore-${process.pid}-${Date.now()}`;
	const rollback = `${root}.rollback-${Date.now()}`;
	fs.mkdirSync(stage, { recursive: true });
	const extracted = childProcess.spawnSync("tar", ["-xf", archive, "-C", stage], {
		encoding: "utf8"
	});
	if (extracted.status !== 0) {
		fs.rmSync(stage, { recursive: true, force: true });
		return failure("recovery_extract_failed", {
			tier,
			stderr: extracted.stderr
		});
	}
	preserve(root, stage, "config.json");
	const stagedState = State.read(root);
	stagedState.tier = tier;
	stagedState.restoreRequired = false;
	stagedState.consecutiveFailures = 0;
	State.write(stage, State.append(stagedState, {
		type: "archive_restored",
		tier,
		archive
	}));
	const health = Integrity.check(stage);
	if (!health.ok) {
		fs.rmSync(stage, { recursive: true, force: true });
		return failure("recovery_archive_unhealthy", { tier, health });
	}
	fs.renameSync(root, rollback);
	try {
		fs.renameSync(stage, root);
	} catch (error) {
		fs.renameSync(rollback, root);
		throw error;
	}
	appendLog(recoveryRoot, {
		type: "archive_restored",
		tier,
		archive,
		rollback
	});
	return {
		ok: true,
		tier,
		archive,
		rollback,
		health
	};
}

function preserve(root, stage, relative) {
	const source = path.join(root, relative);
	if (!fs.existsSync(source)) return;
	fs.copyFileSync(source, path.join(stage, relative));
}

function appendLog(recoveryRoot, value) {
	fs.mkdirSync(recoveryRoot, { recursive: true });
	fs.appendFileSync(
		path.join(recoveryRoot, "rollback.log"),
		`${JSON.stringify({ at: new Date().toISOString(), ...value })}\n`
	);
}

function failure(error, details) {
	return { ok: false, error, ...details };
}

module.exports = {
	restore
};
