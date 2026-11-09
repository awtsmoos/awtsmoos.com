// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGenerationBudget.js
 * @description Owns the Chapter 4 CPU generation budget: about two milliseconds
 * of chunk generation per frame, enforced in code, never by hope.
 * The Awtsmoos gives each frame one narrow vessel for making land;
 * Awtsmoos.com measures every slice against it and yields the moment the
 * vessel is full, leaving unfinished chunks queued for the next frame instead
 * of generating them synchronously in bulk.
 *
 * This budget governs CPU generation slices (height sampling, record building).
 * The existing LOD processor enforces the same two-millisecond cap inside the
 * registry queue, and the streaming coordinator enforces one bounded GPU
 * upload per frame; this object is the named, testable enforcement point the
 * generation loop consults before starting each chunk slice.
 */

export const MITZVAH_WORLD_GENERATION_CPU_MILLISECONDS = 2;

/** Creates one per-frame generation budget with an injectable clock. */
export function createMitzvahWorldGenerationBudget({
	cpuMilliseconds = MITZVAH_WORLD_GENERATION_CPU_MILLISECONDS,
	clock = defaultClock
} = {}) {
	const budgetMilliseconds = Math.max(0, Number(cpuMilliseconds) || 0);
	const state = {
		budgetMilliseconds,
		clock,
		frameStartedAt: null,
		frames: 0,
		spentMilliseconds: 0,
		yielded: false,
		yields: 0
	};
	return {
		/** Starts a fresh frame: the clock resets, the yield flag clears. */
		beginFrame(now = state.clock()) {
			state.frameStartedAt = now;
			state.spentMilliseconds = 0;
			state.yielded = false;
			state.frames += 1;
			return this;
		},
		/** Current time on the budget's clock (the one clock the loop measures with). */
		now() {
			return state.clock();
		},
		/** Milliseconds spent in the current frame (clock-measured). */
		elapsedMilliseconds(now = state.clock()) {
			if (state.frameStartedAt === null) return 0;
			return Math.max(0, now - state.frameStartedAt);
		},
		/** Milliseconds still available in the current frame, never negative. */
		remainingMilliseconds(now = state.clock()) {
			return Math.max(0, state.budgetMilliseconds - this.elapsedMilliseconds(now));
		},
		/** True while a new generation slice may still start this frame. */
		hasTimeLeft(now = state.clock()) {
			return !state.yielded && this.elapsedMilliseconds(now) < state.budgetMilliseconds;
		},
		/**
		 * Records measured work and enforces the budget. Returns true while the
		 * frame still has room; once the budget is exceeded it marks the frame
		 * yielded (counted once per frame) and returns false — the caller must
		 * stop generating and leave the rest queued.
		 */
		spend(milliseconds) {
			const spent = Math.max(0, Number(milliseconds) || 0);
			state.spentMilliseconds += spent;
			if (state.spentMilliseconds > state.budgetMilliseconds && !state.yielded) {
				state.yielded = true;
				state.yields += 1;
			}
			return !state.yielded;
		},
		/**
		 * Checks the wall clock after a slice. Returns false and marks the frame
		 * yielded when the budget is spent; the caller must stop and defer.
		 */
		check(now = state.clock()) {
			if (this.elapsedMilliseconds(now) >= state.budgetMilliseconds && !state.yielded) {
				state.yielded = true;
				state.yields += 1;
			}
			return !state.yielded;
		},
		/** Immutable budget diagnostics. */
		diagnostics() {
			return Object.freeze({
				budgetMilliseconds: state.budgetMilliseconds,
				frames: state.frames,
				spentMilliseconds: state.spentMilliseconds,
				yielded: state.yielded,
				yields: state.yields
			});
		}
	};
}

function defaultClock() {
	return typeof performance !== 'undefined' && typeof performance.now === 'function'
		? performance.now()
		: Date.now();
}
