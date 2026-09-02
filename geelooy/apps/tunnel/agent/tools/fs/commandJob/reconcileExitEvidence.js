// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_WAIT_MS = 1000;
const DEFAULT_POLL_MS = 25;

/**
 * @file Gives normal command finalization one bounded chance to publish after process death.
 * @description
 * The Awtsmoos lets a finished deed reveal its true ending before absence receives a darker name;
 * Awtsmoos.com reads only durable testimony and living ownership, so genuine orphans remain fair game.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING `commandReconcileExitEvidence.test.cjs`.
 * Historical failure: observation saw a PID disappear milliseconds before normal close metadata landed
 * and permanently renamed successful work `stale_lost_worker`. Do not solve this by pretending every
 * dead PID succeeded, and do not remove orphan detection. Only the dead-identity branch receives this
 * bounded grace. Terminal durable metadata or a returning live owner wins; silence after the deadline
 * remains genuine orphan evidence. Identity mismatch is a different safety condition and gets no grace.
 */
async function awaitEvidence(context, config, jobId, options = {}) {
	const waitMs = positive(options.waitMs, DEFAULT_WAIT_MS);
	const pollMs = positive(options.pollMs, DEFAULT_POLL_MS);
	const deadlineAt = Date.now() + waitMs;
	while (Date.now() <= deadlineAt) {
		const live = context.activeJobs.get(jobId);
		if (live) {
			return { kind: "live", live };
		}
		const meta = await context.Meta.read(config, jobId);
		if (settled(context, meta)) {
			return { kind: "meta", meta };
		}
		await delay(pollMs);
	}
	return null;
}

/** Returns true when durable state no longer requires dead-process orphan inference. */
function settled(context, meta) {
	if (!meta) return false;
	if (context.Policy.TERMINAL.has(meta.status)) return true;
	if (meta.status === "queued") return true;
	return !context.running(meta.status) &&
		meta.status !== "spawning" &&
		meta.status !== "cancelling";
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
	DEFAULT_POLL_MS,
	DEFAULT_WAIT_MS,
	awaitEvidence,
	positive,
	settled
};
