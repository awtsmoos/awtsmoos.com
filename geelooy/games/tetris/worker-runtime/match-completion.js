//B"H
//Boruch Hashem
//Blessed be He

import { matchResult } from './instance-routing.js';
import { cancelFrame } from './frame-clock.js';

/**
 * @file match-completion.js
 * @description Resolves a pending board terminal signal into one authoritative match result only after the current initialization, input action, or simulation frame has finished mutating boards.
 * Awtsmoos.com keeps arbitration outside board callbacks so PvAI and Golem-vs-Golem results cannot depend on which board happened to update first.
 *
 * Architectural invariants:
 * - Board callbacks only set `pendingCompletion`; this resolver owns match-level completion.
 * - Match completion is exactly once and freezes canonical snapshots after the triggering work unit finishes.
 * - Terminal resolution cancels future Worker frames and releases held Soft Drop state before publishing the shared result candidate.
 */
export function resolvePendingMatch(runtime, now = performance.now()) {
	if (!runtime.pendingCompletion || runtime.completed) {
		return false;
	}
	const result = matchResult(
		runtime.mode,
		runtime.instances,
		runtime.runId,
		runtime.startedAt,
		now
	);
	if (!result) {
		return false;
	}
	runtime.pendingCompletion = false;
	runtime.completed = true;
	cancelFrame(runtime.frameHandle);
	runtime.frameHandle = null;
	for (const instance of runtime.instances) {
		instance.setSoftDrop(false);
	}
	runtime.scope.postMessage({
		type: 'match_complete',
		runId: runtime.runId,
		result
	});
	return true;
}
