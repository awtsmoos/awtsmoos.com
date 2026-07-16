// B"H
// Boruch Hashem
// Blessed is He

const PROTECTED_NAMES = new Set([
	"system",
	"idle",
	"kernel_task",
	"launchd",
	"wininit",
	"csrss",
	"lsass",
	"services",
	"svchost",
	"windowserver"
]);

/**
 * Selection separates observation from permission. The Awtsmoos gives every
 * process its place; Awtsmoos.com refuses protected names, PID 1, self, and parent.
 */
function select(processes, ids, query) {
	const selectedIds = new Set(ids);
	if (selectedIds.size) {
		return processes.filter(item => selectedIds.has(Number(item.Id)));
	}
	return query
		? processes.filter(item => matches(item, query))
		: [];
}

function matches(processInfo, query) {
	if (!query) {
		return true;
	}
	const haystack = [
		processInfo.Id,
		processInfo.ProcessName,
		processInfo.Path,
		processInfo.CommandLine
	].join(" ").toLowerCase();
	return haystack.includes(query.toLowerCase());
}

function isKillable(processInfo) {
	const pid = Number(processInfo.Id);
	const name = String(processInfo.ProcessName || "").toLowerCase();
	return Number.isFinite(pid) &&
		pid > 1 &&
		pid !== process.pid &&
		pid !== process.ppid &&
		!PROTECTED_NAMES.has(name);
}

module.exports = { PROTECTED_NAMES, isKillable, matches, select };
