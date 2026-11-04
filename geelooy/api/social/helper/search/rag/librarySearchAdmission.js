// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearchAdmission
 * @description
 * The Awtsmoos lets two semantic library searches breathe at once and asks
 * later seekers to wait their turn inside their own public clock;
 * Awtsmoos.com would rather answer one reader well than collapse under
 * seven-lane fan-outs stacked on a two-core box — the production service
 * was OOM-killed mid-battery when unbounded concurrent searches, each
 * fanning out to every lane and every index part, piled onto 1.9 GB.
 * Admission is deliberately narrow: it governs only the all-libraries
 * VECTOR path (the expensive fan-out). Text, exact, and single-lane
 * requests keep their existing behavior. A waiter whose own request
 * deadline passes while queued is refused with a typed SEARCH_BUSY error
 * instead of starting work whose budget is already gone; the search page
 * can then fall back to keyword results honestly.
 */

const { codedError } = require('./strategyText.js');

const MAX_CONCURRENT_VECTOR_SEARCHES = 2;

let activeCount = 0;
const waiters = [];

/** Builds the typed refusal a queued-out request receives. */
function busyError() {
	return codedError(
		'SEARCH_BUSY',
		'Semantic library search is busy with other readers. Please try again.'
	);
}

/** Creates the one-shot release closure for one admitted slot. */
function makeRelease() {
	let released = false;
	return function release() {
		if (released) return;
		released = true;
		const next = waiters.shift();
		if (next) {
			clearTimeout(next.timer);
			// The slot transfers directly: activeCount is unchanged.
			next.resolve(makeRelease());
			return;
		}
		activeCount -= 1;
	};
}

/**
 * Admits immediately while a slot is free; otherwise queues FIFO until a
 * slot frees or the waiter's own deadline passes, whichever comes first.
 */
function acquire(deadlineAt) {
	if (activeCount < MAX_CONCURRENT_VECTOR_SEARCHES) {
		activeCount += 1;
		return Promise.resolve(makeRelease());
	}
	const waitMs = Math.max(0, Math.floor(Number(deadlineAt) || 0) - Date.now());
	if (waitMs <= 0) return Promise.reject(busyError());
	return new Promise((resolve, reject) => {
		const waiter = { resolve, reject, timer: null };
		waiter.timer = setTimeout(() => {
			const index = waiters.indexOf(waiter);
			if (index >= 0) waiters.splice(index, 1);
			reject(busyError());
		}, waitMs);
		waiters.push(waiter);
	});
}

/**
 * Runs one all-libraries search under admission when its strategy is
 * vector; every other strategy runs exactly as before.
 */
async function withLibrarySearchAdmission(options, deadlineAt, run) {
	if (String(options?.strategy || '').toLowerCase() !== 'vector') return run();
	const release = await acquire(deadlineAt);
	try {
		return await run();
	} finally {
		release();
	}
}

/** Testimony for tests and operators: how many are running and waiting. */
function admissionSnapshot() {
	return { active: activeCount, waiting: waiters.length, max: MAX_CONCURRENT_VECTOR_SEARCHES };
}

module.exports = {
	MAX_CONCURRENT_VECTOR_SEARCHES,
	acquire,
	admissionSnapshot,
	busyError,
	withLibrarySearchAdmission
};
