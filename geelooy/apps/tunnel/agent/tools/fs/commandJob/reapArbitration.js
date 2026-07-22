// B"H
// Boruch Hashem
// Blessed is He

const Finalization = require("./finalization.js");
const Identity = require("./processIdentity.js");
const Observe = require("./processObserve.js");

const DEFAULT_EXIT_EVIDENCE_WAIT_MS = 1000;
const DEFAULT_EXIT_EVIDENCE_POLL_MS = 25;
const AUTOMATIC_STATUSES = new Set([
	"timed_out",
	"stale_lost_worker"
]);

/**
 * @file Arbitrates automatic reaping against already-witnessed process exit.
 * @description
 * The Awtsmoos never confuses delayed bookkeeping with missing life. Awtsmoos.com
 * lets normal close evidence finish first, while explicit cancellation and exact
 * living-worker cleanup retain their independent authority.
 */
async function preferNormal(config, jobId, live, request = {}, options = {}) {
	if (!AUTOMATIC_STATUSES.has(String(request.status || ""))) return null;
	if (live.finalizing) return live.finalizing;
	const direct = exitPatch(live.child);
	if (direct) return reserveExit(config, jobId, live, request, direct);
	const observe = options.observe || Observe.observe;
	const expected = Identity.fromMeta(live.meta);
	const observed = await Promise.resolve(observe(expected.pid));
	const comparison = Identity.compare(expected, observed);
	if (comparison.state !== "dead") return null;
	return waitForExitEvidence(config, jobId, live, request, options);
}

async function waitForExitEvidence(config, jobId, live, request, options = {}) {
	const waitMs = positive(
		options.waitMs,
		DEFAULT_EXIT_EVIDENCE_WAIT_MS
	);
	const pollMs = positive(
		options.pollMs,
		DEFAULT_EXIT_EVIDENCE_POLL_MS
	);
	const deadlineAt = Date.now() + waitMs;
	while (Date.now() <= deadlineAt) {
		if (live.finalizing) return live.finalizing;
		const patch = exitPatch(live.child);
		if (patch) return reserveExit(config, jobId, live, request, patch);
		await delay(pollMs);
	}
	return null;
}

function reserveExit(config, jobId, live, request, patch) {
	return Finalization.reserve(config, jobId, live, async () => ({
		...patch,
		reapDeferredToProcessExit: true,
		reapReasonObserved: request.reason || null
	}));
}

function exitPatch(child = {}) {
	const exitCode = Number.isInteger(child.exitCode)
		? child.exitCode
		: null;
	const signal = child.signalCode || null;
	if (exitCode === null && !signal) return null;
	return {
		status: exitCode === 0 && !signal
			? "completed"
			: "failed",
		exitCode,
		signal
	};
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	AUTOMATIC_STATUSES,
	DEFAULT_EXIT_EVIDENCE_POLL_MS,
	DEFAULT_EXIT_EVIDENCE_WAIT_MS,
	exitPatch,
	preferNormal,
	waitForExitEvidence
};
