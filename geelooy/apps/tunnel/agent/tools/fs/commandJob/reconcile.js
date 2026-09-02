// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Lifecycle = require("./lifecycle.js");
const Identity = require("./processIdentity.js");
const Observe = require("./processObserve.js");
const ExitEvidence = require("./reconcileExitEvidence.js");

/**
 * @file Reconciles detached command truth without racing normal process finalization.
 * @description
 * The Awtsmoos lets a finished deed reveal its terminal light before absence receives a darker name;
 * Awtsmoos.com waits only for exact durable evidence, while recycled identity still fails without delay or blame.
 */
async function reconcile(config, jobId, meta) {
	await Context.refreshCounts(config, jobId, meta);
	const live = Context.activeJobs.get(jobId);
	if (live && !Context.Policy.TERMINAL.has(meta.status)) {
		return mergeLive(meta, live);
	}
	if (meta.status === "queued") return meta;
	if (!Context.running(meta.status) &&
		meta.status !== "spawning" &&
		meta.status !== "cancelling") {
		return meta;
	}
	const fresh = await Context.Meta.read(config, jobId);
	if (fresh) {
		await Context.refreshCounts(config, jobId, fresh);
		if (Context.Policy.TERMINAL.has(fresh.status)) return fresh;
		const freshLive = Context.activeJobs.get(jobId);
		if (freshLive) return mergeLive(fresh, freshLive);
		if (fresh.status === "queued") return fresh;
		meta = fresh;
	}
	const expected = Identity.fromMeta(meta);
	const observed = await Observe.observe(expected.pid);
	const comparison = Identity.compare(expected, observed);
	if (comparison.ok) return markDetached(meta, observed);
	if (comparison.state === "dead") {
		const evidence = await ExitEvidence.awaitEvidence(Context, config, jobId);
		if (evidence?.kind === "meta") return evidence.meta;
		if (evidence?.kind === "live") return mergeLive(meta, evidence.live);
	}
	return finalizeUnowned(config, jobId, meta, comparison);
}

/** Finalizes only after identity mismatch or exhausted dead-process evidence grace. */
function finalizeUnowned(config, jobId, meta, comparison = {}) {
	const dead = comparison.state === "dead";
	return Lifecycle.finalizeDetached(config, jobId, meta, {
		status: dead ? "stale_lost_worker" : "identity_unverified",
		staleRecovered: dead,
		error: comparison.reason || comparison.state,
		processComparison: comparison,
		worker: {
			...(meta.worker || {}),
			detached: true
		}
	});
}

function mergeLive(meta, live) {
	return {
		...meta,
		...live.meta,
		stdoutChars: meta.stdoutChars,
		stderrChars: meta.stderrChars
	};
}

function markDetached(meta, observed) {
	return {
		...meta,
		status: "detached_running",
		detachedRunning: true,
		processIdentity: Identity.create(observed),
		worker: {
			...(meta.worker || {}),
			pid: observed.pid,
			processGroupId: observed.processGroupId,
			birthToken: observed.birthToken,
			state: "detached_running",
			detached: true,
			heartbeatAt: meta.heartbeatAt || meta.updatedAt || meta.startedAt
		},
		receipt: {
			...(meta.receipt || {}),
			state: "detached_running",
			updatedAt: new Date().toISOString()
		}
	};
}

module.exports = {
	finalizeUnowned,
	markDetached,
	mergeLive,
	reconcile
};
