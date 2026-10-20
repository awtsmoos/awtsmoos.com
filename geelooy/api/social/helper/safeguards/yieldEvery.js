//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module YieldEvery
 * @description
 * Cooperative loop protection (safeguards program, Phase 3,
 * 2026-10-20). A long synchronous stretch is what froze the event
 * loop during the flap: guards could not fire because the loop
 * itself never got a turn. Long loops therefore owe the loop a
 * breath on a TIME budget, not a count budget — a count of cheap
 * iterations and a count of expensive ones are not the same debt.
 *
 * USAGE:
 *   const tick = yieldEvery(8);
 *   for (const item of bigList) { work(item); await tick(); }
 *
 * The tick is free while the budget lasts (one Date.now() call)
 * and yields via setImmediate only when the budget is spent, so
 * hot loops keep their speed and the loop keeps its pulse.
 */

/** @constant {number} Default per-stretch CPU budget in ms. */
const DEFAULT_BUDGET_MS = 8;

/**
 * Creates a budget-based yield tick for one loop.
 * @param {number} [budgetMs] Max ms of work between yields.
 * @returns {Function} Async tick: resolves true when it yielded.
 */
function yieldEvery(budgetMs) {
	const budget = Number(budgetMs) > 0 ? Number(budgetMs) : DEFAULT_BUDGET_MS;
	let last = Date.now();
	/**
	 * Call once per iteration (or per small inner batch).
	 * @returns {Promise<boolean>} True when a yield happened.
	 */
	return async function tick() {
		const now = Date.now();
		if (now - last < budget) return false;
		last = now;
		await new Promise((resolve) => setImmediate(resolve));
		return true;
	};
}

/**
 * Synchronous budget probe for loops that cannot await: reports
 * whether the budget is spent so the caller can break the work
 * into setImmediate chunks itself. Prefer yieldEvery() wherever
 * the loop is already async.
 * @param {{last:number}} state Mutable state kept by the caller.
 * @param {number} [budgetMs] Max ms between yields.
 * @returns {boolean} True when the caller should yield now.
 */
function budgetSpent(state, budgetMs) {
	const budget = Number(budgetMs) > 0 ? Number(budgetMs) : DEFAULT_BUDGET_MS;
	const now = Date.now();
	if (now - state.last < budget) return false;
	state.last = now;
	return true;
}

module.exports = { yieldEvery, budgetSpent, DEFAULT_BUDGET_MS };
