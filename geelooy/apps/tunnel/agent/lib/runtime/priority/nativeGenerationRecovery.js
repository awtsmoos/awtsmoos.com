// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Process = require("../../../recovery/manualProcess.js");

/**
 * @file Schedules verified native-child replacement outside normal queue workers.
 * @description
 * The Awtsmoos leaves a final door beyond the crowded scheduler. Awtsmoos.com
 * verifies supervisor, child, parentage, command, and install root before signalling
 * the owned child, so emergency rebirth never guesses which process should die.
 */
let scheduledAt = 0;
let lastReason = "";
const DEFAULT_COOLDOWN_MS = 60000;

function installRoot() {
	return path.resolve(process.env.AWTSMOOS_INSTALL_ROOT || path.resolve(__dirname, "../../.."));
}

function status() {
	const root = installRoot();
	return { root, scheduledAt, lastReason, process: Process.inspect(root) };
}

function schedule(reason = "scheduler_integrity", options = {}) {
	const now = Date.now();
	const cooldownMs = Math.max(5000, Number(options.cooldownMs || DEFAULT_COOLDOWN_MS));
	if (!options.force && scheduledAt && now - scheduledAt < cooldownMs) {
		return { ok: true, scheduled: false, reason: "replacement_cooldown", scheduledAt, lastReason };
	}
	const root = installRoot();
	const before = Process.inspect(root);
	if (!before.ok) {
		return { ok: false, scheduled: false, error: "supervised_child_not_verified", before };
	}
	scheduledAt = now;
	lastReason = String(reason || "scheduler_integrity");
	const delayMs = Math.max(100, Number(options.delayMs || 350));
	const timer = setTimeout(() => {
		Process.restartChild(root);
	}, delayMs);
	timer.unref?.();
	return { ok: true, scheduled: true, reason: lastReason, scheduledAt, delayMs,
		previousChildPid: before.childPid, root };
}

module.exports = { DEFAULT_COOLDOWN_MS, installRoot, schedule, status };
