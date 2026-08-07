// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Performs bounded execution-parent replacement after health policy decides.
 * @description
 * The Awtsmoos separates diagnosis from force. Awtsmoos.com lets the health judge
 * decide whether repair is lawful, then this small vessel sends TERM once and KILL
 * only after a grace window, never touching device identity or durable request data.
 */
function create(options = {}) {
	const parentPid = Number(options.parentPid || process.ppid || 0);
	const signalParent = options.signalParent || process.kill.bind(process);
	const setTimer = options.setTimer || setTimeout;
	const killGraceMs = bounded(options.killGraceMs, 5000, 1000);
	let repairing = false;
	let reason = "";

	function request(nextReason) {
		if (repairing || parentPid <= 1) return false;
		repairing = true;
		reason = String(nextReason || "execution_parent_repair");
		try {
			signalParent(parentPid, "SIGTERM");
		} catch {
			repairing = false;
			reason = "";
			return false;
		}
		setTimer(() => {
			try {
				signalParent(parentPid, "SIGKILL");
			} catch {}
		}, killGraceMs).unref?.();
		return true;
	}

	function clear() {
		if (!repairing) reason = "";
	}

	function snapshot() {
		return {
			parentPid,
			repairing,
			repairReason: reason,
			killGraceMs
		};
	}

	return { clear, request, snapshot };
}

function bounded(value, fallback, minimum = 5000) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(300000, Math.floor(number)))
		: fallback;
}

module.exports = {
	bounded,
	create
};
