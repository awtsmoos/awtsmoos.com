//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file seriesBootWarm.test.cjs
 * @description
 * Boot-warm round (2026-11-26): after a process start the large-series
 * details memo is empty and the first reader paid the full cold fill
 * (13.55s for ikar/encyclopedia). These tests guard the scheduling
 * contract of SeriesBootWarm: exactly one deferred warm per process,
 * through the canonical request context, borrowing only the database
 * handle; a closed read shed defers to one retry instead of filling;
 * and a vessel without a database schedules nothing.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	scheduleSeriesBootWarm,
	_resetSeriesBootWarm,
	WARM_TARGETS,
	WARM_DELAY_MS,
	WARM_RETRY_DELAY_MS
} = require('../seriesBootWarm.js');

/** Captures scheduled callbacks instead of running real timers. */
function fakeClock() {
	const timers = [];
	return {
		timers,
		delay(fn, ms) {
			timers.push({ fn, ms });
		},
		async fireNext() {
			const next = timers.shift();
			assert.ok(next, 'expected a scheduled timer');
			await next.fn();
			return next.ms;
		}
	};
}

test('schedules exactly one warm per process, with the canonical context', async () => {
	_resetSeriesBootWarm();
	const clock = fakeClock();
	const fakeDb = { name: 'shared-db' };
	const reads = [];
	const overrides = {
		delay: clock.delay,
		shedClosed: () => false,
		read: async (vessel, target) => { reads.push({ vessel, target }); }
	};
	assert.equal(scheduleSeriesBootWarm({ db: fakeDb, $_GET: { limit: '5' } }, overrides), true);
	assert.equal(scheduleSeriesBootWarm({ db: fakeDb }, overrides), false);
	assert.equal(clock.timers.length, 1);
	assert.equal(clock.timers[0].ms, WARM_DELAY_MS);
	assert.equal(reads.length, 0, 'the warm is deferred, never inline');
	await clock.fireNext();
	assert.equal(reads.length, WARM_TARGETS.length);
	assert.deepEqual(reads[0].target, { heichelId: 'ikar', seriesId: 'encyclopedia' });
	// Only the database handle crosses into the background fill — the
	// caller's request-scoped state ($_GET and friends) stays behind.
	assert.deepEqual(Object.keys(reads[0].vessel), ['db']);
	assert.equal(reads[0].vessel.db, fakeDb);
});

test('a closed read shed defers the fill to exactly one retry', async () => {
	_resetSeriesBootWarm();
	const clock = fakeClock();
	let shedChecks = 0;
	let readCount = 0;
	const overrides = {
		delay: clock.delay,
		shedClosed: () => { shedChecks += 1; return shedChecks === 1; },
		read: async () => { readCount += 1; }
	};
	assert.equal(scheduleSeriesBootWarm({ db: {} }, overrides), true);
	await clock.fireNext();
	assert.equal(readCount, 0, 'no fill while the shed is closed');
	assert.equal(clock.timers.length, 1);
	assert.equal(clock.timers[0].ms, WARM_RETRY_DELAY_MS);
	await clock.fireNext();
	assert.equal(readCount, WARM_TARGETS.length, 'the retry fills once the shed opens');
	assert.equal(clock.timers.length, 0, 'no further retries are scheduled');
});

test('a vessel without a database schedules nothing', () => {
	_resetSeriesBootWarm();
	const clock = fakeClock();
	assert.equal(scheduleSeriesBootWarm(null, { delay: clock.delay }), false);
	assert.equal(scheduleSeriesBootWarm({}, { delay: clock.delay }), false);
	assert.equal(clock.timers.length, 0);
	// A failed schedule must not consume the one-per-process slot.
	assert.equal(scheduleSeriesBootWarm({ db: {} }, { delay: clock.delay }), true);
});

test('a failing fill is swallowed and never rethrows', async () => {
	_resetSeriesBootWarm();
	const clock = fakeClock();
	const overrides = {
		delay: clock.delay,
		shedClosed: () => false,
		read: async () => { throw new Error('db unavailable'); }
	};
	assert.equal(scheduleSeriesBootWarm({ db: {} }, overrides), true);
	await clock.fireNext(); // resolves — the warm may fail, the process may not
});
