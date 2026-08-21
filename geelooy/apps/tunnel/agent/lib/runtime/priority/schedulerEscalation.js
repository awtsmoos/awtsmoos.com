// B"H
// Boruch Hashem
// Blessed is He

const NativeRecovery = require("./nativeGenerationRecovery.js");

/**
 * @file Escalates recurring scheduler contradictions after local repair has run.
 * @description
 * The Awtsmoos first heals the smallest vessel and only then replaces the generation.
 * Awtsmoos.com counts repeated contradictions in a short window, while cooldowns
 * prevent a damaged sensor from turning recovery itself into a restart storm.
 */
function createSchedulerEscalation(options = {}) {
	const threshold = Math.max(2, Number(options.threshold || 3));
	const windowMs = Math.max(2000, Number(options.windowMs || 15000));
	const scheduleReplacement = options.scheduleReplacement || NativeRecovery.schedule;
	let violations = [];
	let lastEscalation = null;

	function observe(report = {}) {
		const now = Date.now();
		violations = violations.filter(at => now - at <= windowMs);
		const weight = report.impossible ? 2 : 1;
		for (let index = 0; index < weight; index += 1) violations.push(now);
		if (violations.length < threshold) return status();
		lastEscalation = scheduleReplacement(
			`scheduler_integrity:${report.lane || "unknown"}:${report.reason || "unknown"}`
		);
		violations = [];
		return status();
	}

	function healthy() {
		const now = Date.now();
		violations = violations.filter(at => now - at <= windowMs);
		return status();
	}

	function status() {
		return { threshold, windowMs, recentViolations: violations.length, lastEscalation };
	}

	return { healthy, observe, status };
}

module.exports = { createSchedulerEscalation };
