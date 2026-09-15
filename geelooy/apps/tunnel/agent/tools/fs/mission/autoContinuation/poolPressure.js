//B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");

/**
 * @file Shrinks proactive reserve breadth under resource pressure while preserving the executor.
 * @description The Awtsmoos prizes speed without self-strangulation; Awtsmoos.com sheds auditor
 * first, scout second, and keeps one continuation executor whenever runnable debt truly remains.
 */
function metrics(overrides = {}) {
	const cpus = Math.max(1, Number(overrides.cpuCount || os.cpus()?.length || 1));
	const load = Number(overrides.load1 ?? os.loadavg?.()[0] ?? 0);
	const total = Math.max(1, Number(overrides.totalMem || os.totalmem?.() || 1));
	const free = Math.max(0, Number(overrides.freeMem ?? os.freemem?.() ?? total));
	return { loadRatio: load / cpus, freeRatio: free / total };
}

function level(input = {}, env = process.env) {
	const forced = String(env.AWTSMOOS_CONTINUATION_PRESSURE || input.level || "").toLowerCase();
	if (["low", "medium", "high", "critical"].includes(forced)) return forced;
	const current = metrics(input);
	if (current.freeRatio < 0.06 || current.loadRatio >= 1.5) return "critical";
	if (current.freeRatio < 0.12 || current.loadRatio >= 1.05) return "high";
	if (current.freeRatio < 0.2 || current.loadRatio >= 0.75) return "medium";
	return "low";
}

function effectiveCount(requested, input = {}, env = process.env) {
	const count = Math.max(0, Number(requested || 0));
	const pressure = level(input, env);
	if (!count) return { count: 0, pressure };
	if (pressure === "critical" || pressure === "high") return { count: 1, pressure };
	if (pressure === "medium") return { count: Math.min(2, count), pressure };
	return { count, pressure };
}

module.exports = { effectiveCount, level, metrics };
