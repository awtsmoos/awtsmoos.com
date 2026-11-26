//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module SeriesBootWarm
 * @description
 * Boot-time warming for the large-series details memo — element (2) of
 * the staged cold-fill design recorded in the Social ledger (run 4,
 * 2026-11-25: "warm large-series memos at boot / longer TTL"). Run 5
 * shipped element (1), the cooperative yield inside the fill, plus the
 * bounded details memo itself, and named this module's lever as the
 * remaining one: after a process start the memo is empty, so the first
 * reader of a large series paid the full cold fill (13.55s measured
 * for ikar/encyclopedia, 2,073 posts) and first-hit-after-idle paid it
 * again whenever the memo lapsed.
 *
 * This module schedules ONE deferred warm per process, invoked from
 * the posts route composition (which first runs at process start).
 * It fills through the exact compatibility read the route serves,
 * with the canonical request context (details, no property
 * projection, no pagination), so the memo key the warm primes is the
 * key the first real request computes. The fill beneath already
 * yields every 24 records, so the warm never starves neighbors; it
 * defers until the process has settled, and if the read shed is
 * closed it retries once before leaving the route's own bounded
 * cold-fill admission to do the work. Warming never throws and never
 * blocks a request: any failure is swallowed and the cold path
 * remains exactly as it was.
 *
 * The target list is deliberately explicit and bounded — the one
 * measured cold series. Extending it is a one-line edit here, never
 * a boot-time tree walk (the walk is the cost being avoided).
 */

const { readPostsCompatible } = require('./seriesReadCompatibility.js');
const { readShed } = require('../safeguards/readShed.js');

const WARM_TARGETS = [
	{ heichelId: 'ikar', seriesId: 'encyclopedia' }
];
const WARM_DELAY_MS = 20 * 1000;
const WARM_RETRY_DELAY_MS = 120 * 1000;
const MAX_WARM_ATTEMPTS = 2;

let scheduled = false;

/** Fills one target's details memo through the route's own read path. */
async function warmTarget(vessel, target) {
	await readPostsCompatible({
		$i: vessel,
		heichelId: target.heichelId,
		seriesId: target.seriesId,
		withDetails: true,
		properties: null,
		pagination: null
	});
}

async function runWarm(vessel, attempt, deps) {
	try {
		if (deps.shedClosed()) {
			if (attempt < MAX_WARM_ATTEMPTS) {
				deps.delay(
					() => runWarm(vessel, attempt + 1, deps),
					WARM_RETRY_DELAY_MS
				);
			}
			return;
		}
		for (const target of WARM_TARGETS) {
			await deps.read(vessel, target);
		}
	} catch (_) {
		// Warming is an optimization only; the cold read path remains.
	}
}

/**
 * Schedules the per-process boot warm. The first caller wins; every
 * later call is a no-op. Only the database handle is borrowed from
 * the caller's vessel — the read path needs nothing else, and no
 * request-scoped state may leak into a background fill.
 * @param {object} $i Vessel carrying the shared database handle.
 * @param {object} [overrides] Test seams: read, shedClosed, delay, delayMs.
 * @returns {boolean} True when this call scheduled the warm.
 */
function scheduleSeriesBootWarm($i, overrides = {}) {
	if (scheduled) return false;
	if (!$i || !$i.db) return false;
	scheduled = true;
	const deps = {
		read: overrides.read || warmTarget,
		shedClosed: overrides.shedClosed || (() => Boolean(readShed())),
		delay: overrides.delay || ((fn, ms) => {
			const timer = setTimeout(fn, ms);
			if (timer.unref) timer.unref();
		})
	};
	const vessel = { db: $i.db };
	deps.delay(
		() => runWarm(vessel, 1, deps),
		overrides.delayMs ?? WARM_DELAY_MS
	);
	return true;
}

/** Test seam: re-arms the per-process guard. */
function _resetSeriesBootWarm() {
	scheduled = false;
}

module.exports = {
	scheduleSeriesBootWarm,
	_resetSeriesBootWarm,
	WARM_TARGETS,
	WARM_DELAY_MS,
	WARM_RETRY_DELAY_MS,
	MAX_WARM_ATTEMPTS
};
