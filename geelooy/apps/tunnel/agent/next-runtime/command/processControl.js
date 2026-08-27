// B"H
const Identity = require("./identity.js");
const ProcessGroup = require("./processGroup.js");
const ProcessObserve = require("./processObserve.js");

/**
 * B"H — Cancellation proves identity without blocking the event loop, then asks
 * the family to leave. Signal races become receipts, never supervisor death.
 */
async function cleanupProcess(expected = {}, options = {}) {
	const observe = options.observe || ProcessObserve.observeProcessAsync;
	const groupAlive = options.groupAlive || ProcessGroup.groupAliveAsync;
	const signalGroup = options.signalGroup || ProcessGroup.signalGroup;
	const observed = await Promise.resolve(observe(expected.pid));
	const comparison = Identity.compareProcess(expected, observed);
	if (comparison.state === "dead") return receipt("cleaned", expected, observed, { alreadyDead: true });
	if (!comparison.ok) return receipt("identity_unverified", expected, observed, { comparison });
	const graceMs = positive(options.graceMs, 300);
	const pollMs = positive(options.pollMs, 25);
	const attempts = [];
	const term = await Promise.resolve(signalGroup(expected, "SIGTERM"));
	attempts.push(term);
	if (term.absent || await waitUntilDead(expected.processGroupId, graceMs, pollMs, groupAlive)) {
		return receipt("cleaned", expected, observed, { attempts, signals: sentSignals(attempts) });
	}
	if (!term.sent && term.errorCode) {
		return receipt("cleanup_failed", expected, observed, {
			attempts,
			signals: sentSignals(attempts),
			error: `signal_failed:${term.errorCode}`
		});
	}
	const kill = await Promise.resolve(signalGroup(expected, "SIGKILL"));
	attempts.push(kill);
	const cleaned = kill.absent || await waitUntilDead(expected.processGroupId, graceMs, pollMs, groupAlive);
	return receipt(cleaned ? "cleaned" : "cleanup_failed", expected, observed, {
		attempts,
		signals: sentSignals(attempts),
		error: cleaned ? null : `signal_failed:${kill.errorCode || "group_still_alive"}`
	});
}

async function waitUntilDead(processGroupId, timeoutMs, pollMs, customGroupAlive) {
	const alive = customGroupAlive || ProcessGroup.groupAliveAsync;
	const deadline = Date.now() + timeoutMs;
	while (Date.now() <= deadline) {
		if (!await Promise.resolve(alive(processGroupId))) return true;
		await sleep(pollMs);
	}
	return !await Promise.resolve(alive(processGroupId));
}

function sentSignals(attempts) {
	return attempts.filter(attempt => attempt?.sent).map(attempt => attempt.signal);
}
function receipt(state, expected, observed, details = {}) {
	return {
		ok: state === "cleaned",
		state,
		expected: structuredClone(expected),
		observed: structuredClone(observed),
		at: new Date().toISOString(),
		...details
	};
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
module.exports = { cleanupProcess, waitUntilDead };
