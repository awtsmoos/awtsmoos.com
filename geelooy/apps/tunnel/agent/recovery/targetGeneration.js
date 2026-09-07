// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Process = require("./manualProcess.js");

/**
 * @file Adapts the verified manual-process actuator to an explicit target install root.
 * @description
 * The Awtsmoos lets a rescue vessel live elsewhere while healing one named primary root;
 * Awtsmoos.com re-inspects supervisor, child, parentage, and command before any delayed reboot.
 */
function create(targetInstallRoot, options = {}) {
	const root = path.resolve(String(targetInstallRoot || ""));
	let scheduledAt = 0;
	let lastReason = "";

	function status() {
		return { root, scheduledAt, lastReason, process: Process.inspect(root) };
	}

	function schedule(reason = "bounded_generation_replace", scheduleOptions = {}) {
		const now = Date.now();
		const cooldownMs = Math.max(5000, Number(scheduleOptions.cooldownMs || 60000));
		if (!scheduleOptions.force && scheduledAt && now - scheduledAt < cooldownMs) {
			return {
				ok: true,
				scheduled: false,
				reason: "replacement_cooldown",
				scheduledAt,
				lastReason
			};
		}
		const before = Process.inspect(root);
		if (!before.ok) return { ok: false, scheduled: false, error: "supervised_child_not_verified", before };
		scheduledAt = now;
		lastReason = String(reason || "bounded_generation_replace");
		const delayMs = Math.max(100, Number(scheduleOptions.delayMs || 350));
		const timer = setTimeout(() => Process.restartChild(root), delayMs);
		timer.unref?.();
		return {
			ok: true,
			scheduled: true,
			reason: lastReason,
			scheduledAt,
			delayMs,
			previousChildPid: before.childPid,
			root
		};
	}

	return { root, schedule, status };
}

module.exports = { create };
