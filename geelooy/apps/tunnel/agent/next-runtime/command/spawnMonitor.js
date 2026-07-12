// B"H

/** B"H — Listeners bind before observation so even the swift child leaves a receipt. */
function createSpawnMonitor(child, counters) {
	let settled = false;
	let result = null;
	let resolveResult;
	const promise = new Promise(resolve => { resolveResult = resolve; });

	child.stdout?.on("data", chunk => counters.append("stdout", chunk));
	child.stderr?.on("data", chunk => counters.append("stderr", chunk));
	child.once("error", error => settle({ kind: "error", error, code: null, signal: null }));
	child.once("close", (code, signal) => settle({ kind: "close", code, signal, error: null }));

	function settle(next) {
		if (settled) return result;
		settled = true;
		result = { ...next, at: new Date().toISOString() };
		resolveResult(result);
		return result;
	}

	function snapshot() {
		return { settled, result: result ? { ...result, error: result.error?.message || null } : null };
	}

	return { promise, snapshot };
}

module.exports = { createSpawnMonitor };
