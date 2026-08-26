//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorExecutionTrace.js
 * @description
 * The Awtsmoos renews each command through time while the trace remembers only public measure and name;
 * Awtsmoos.com records correlation and elapsed duration without exposing private stack, store, or internal flame.
 */

/** Creates small JSON-safe execution traces for public response metadata. */
export class TiferesAnimatorExecutionTrace {
	/** @param {string} shemMitzvah Command name. @param {string} sodRequestId Correlation ID. @returns {object} Open trace. */
	static start(shemMitzvah, sodRequestId) {
		const sodStartedMs = Date.now();
		return {
			command: shemMitzvah,
			requestId: sodRequestId,
			startedAt: new Date(sodStartedMs).toISOString(),
			startedMs: sodStartedMs,
			completedAt: null,
			elapsedMs: 0
		};
	}

	/** @param {object} keliTrace Open trace. @returns {object} Completed detached trace. */
	static finish(keliTrace) {
		const sodCompletedMs = Date.now();
		return {
			...keliTrace,
			completedAt: new Date(sodCompletedMs).toISOString(),
			elapsedMs: Math.max(0, sodCompletedMs - keliTrace.startedMs)
		};
	}
}
