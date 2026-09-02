// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./processIdentity.js");

/**
 * @file Renders non-terminal detached command reconciliation testimony.
 * @description
 * This Malchus-like view manifests what the observers know without mutating durable terminal truth.
 * Awtsmoos.com lets one dead leader and one living family appear as distinct facts, not one verdict.
 * The Awtsmoos renews witness and vessel with every breath and every shore;
 * ambiguity remains visible until stronger evidence reveals what truly lives no more.
 */
function markDetached(meta, observed) {
	return detachedMeta(meta, {
		processIdentity: Identity.create(observed),
		leaderState: "alive",
		processGroupAlive: true,
		processGroupObservationVerified: true
	});
}

/** Preserves original identity while descendants survive after the tracked leader exits. */
function markGroupDetached(meta, comparison, group) {
	return detachedMeta(meta, {
		leaderState: comparison.state,
		processComparison: comparison,
		processGroupAlive: true,
		processGroupObservationVerified: true,
		processGroupWitness: group
	});
}

/** Fails closed when group observation cannot establish either continued life or verified absence. */
function markObservationDeferred(meta, comparison, group) {
	return detachedMeta(meta, {
		leaderState: comparison.state,
		processComparison: comparison,
		processGroupAlive: null,
		processGroupObservationVerified: false,
		processGroupWitness: group,
		reconciliationDeferred: true
	});
}

/** Builds one ephemeral detached-running view while leaving stored status available for later checks. */
function detachedMeta(meta, patch = {}) {
	return {
		...meta,
		...patch,
		status: "detached_running",
		detachedRunning: true,
		worker: {
			...(meta.worker || {}),
			state: "detached_running",
			detached: true
		},
		receipt: {
			...(meta.receipt || {}),
			state: "detached_running",
			updatedAt: new Date().toISOString()
		}
	};
}

/** Merges in-memory live truth without allowing stale persisted stream counts to be erased. */
function mergeLive(meta, live) {
	return {
		...meta,
		...live.meta,
		stdoutChars: meta.stdoutChars,
		stderrChars: meta.stderrChars
	};
}

module.exports = {
	detachedMeta,
	markDetached,
	markGroupDetached,
	markObservationDeferred,
	mergeLive
};
