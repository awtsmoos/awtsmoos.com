// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/refreshDeferral.js
 * @chapter The Court Waits While The Import Runs
 * @description
 * A refcounted deferral for the complement refresh (the full-graph
 * verify in reachableComplement.js). A refresh is O(graph) —
 * seconds-to-minutes at 14 GB — and the growth gate lets it fire
 * about every 270 posts during a bulk import, stalling the job for
 * the whole verify each time (measured: 75 s stalls on the live
 * Bereishit Rabbah job). The import job defers the refresh while it
 * runs and clears the deferral when it ends; the next idle boundary
 * or maintenance timer then runs the one refresh the job's churn
 * earned. The deferral is a refcount, so concurrent jobs nest
 * correctly, and it is cleared in a finally, so a crashed job cannot
 * defer refreshes forever. A refresh is maintenance, never
 * correctness — deferring it cannot lose a free range (frees are
 * still tracked in the free list and the pending ledger).
 */

let deferCount = 0;

function deferRefresh() {
	deferCount += 1;
	return deferCount;
}

function undeferRefresh() {
	if (deferCount > 0) deferCount -= 1;
	return deferCount;
}

function isRefreshDeferred() {
	return deferCount > 0;
}

module.exports = { deferRefresh, undeferRefresh, isRefreshDeferred };
