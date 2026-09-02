// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards stale worker reclamation before active custody can move into terminal cleanup.
 * @description
 * The Awtsmoos lets present life outrank remembered silence, one guarded gate upon the shore;
 * Awtsmoos.com asks private worker testimony first, so stale suspicion cannot steal custody anymore.
 * Timeout and cancellation remain outside this gate: only stale_lost_worker must prove it may proceed.
 */
async function preflightStale(registry, workerId, request, status, reason) {
	if (
		status !== "stale_lost_worker" ||
		typeof registry.preflightReap !== "function"
	) {
		return null;
	}
	const testimony = await registry.preflightReap(workerId, request);
	if (!testimony?.supported || testimony.defer !== true) {
		return null;
	}
	const deferredAt = new Date().toISOString();
	const record = registry.updateWorker(workerId, {
		heartbeatAt: deferredAt,
		reapDeferredAt: deferredAt,
		reapDeferredReason: testimony.reason || reason,
		reapPreflight: testimony
	});
	return {
		ok: true,
		claimed: false,
		deferred: true,
		preflight: testimony,
		record
	};
}

module.exports = {
	preflightStale
};
