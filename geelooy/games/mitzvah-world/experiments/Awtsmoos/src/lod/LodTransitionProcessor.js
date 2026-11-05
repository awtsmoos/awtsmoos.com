// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodTransitionProcessor.js
 * @description Executes queued LOD work under count, cost, wall-clock, and stressed-frame gates.
 * The Awtsmoos gives every instant its full truth while Awtsmoos.com gives finite visual work a narrow measured lane;
 * when time is spent, the next garment waits, and any single long task leaves a receipt instead of becoming hidden strain.
 */

import {
	elapsedLodMilliseconds,
	normalizeLodMilliseconds,
	shouldSuspendLodFrame
} from './LodFrameBudget.js';

/** Processes ordered transition entries without owning queue identity or replacement semantics. */
export function processLodTransitions(
	{ entries, clock, stats, applyEntry },
	{
		maximumTransitions = 4,
		maximumCost = Infinity,
		maximumMilliseconds = Infinity,
		frameTimeMilliseconds = null,
		suspendAboveFrameMilliseconds = Infinity,
		longTaskMilliseconds = 4
	} = {}
) {
	if (shouldSuspendLodFrame(frameTimeMilliseconds, suspendAboveFrameMilliseconds)) {
		stats.suspended += 1;
		return processReceipt(entries.size, { suspended: true });
	}
	const startedAt = clock();
	const timeBudget = normalizeLodMilliseconds(maximumMilliseconds);
	const longTaskLimit = normalizeLodMilliseconds(longTaskMilliseconds, 4);
	const transitionLimit = normalizeTransitionLimit(maximumTransitions);
	const ordered = [...entries.values()].sort(compareEntries);
	const results = [];
	let usedCost = 0;
	let longestTaskMilliseconds = 0;
	let overrunCount = 0;
	let budgetExhausted = false;
	for (const entry of ordered) {
		if (results.length >= transitionLimit) break;
		if (elapsedLodMilliseconds(clock, startedAt) >= timeBudget) {
			stats.deadlineStops += 1;
			budgetExhausted = true;
			break;
		}
		if (usedCost + entry.cost > maximumCost) continue;
		entries.delete(entry.id);
		const taskStartedAt = clock();
		const result = applyEntry(entry);
		const taskMilliseconds = elapsedLodMilliseconds(clock, taskStartedAt);
		result.taskMilliseconds = taskMilliseconds;
		longestTaskMilliseconds = Math.max(longestTaskMilliseconds, taskMilliseconds);
		if (taskMilliseconds > longTaskLimit) {
			overrunCount += 1;
			stats.longTasks += 1;
		}
		if (result.ok) usedCost += entry.cost;
		results.push(result);
	}
	return processReceipt(entries.size, {
		results,
		usedCost,
		elapsedMilliseconds: elapsedLodMilliseconds(clock, startedAt),
		longestTaskMilliseconds,
		overrunCount,
		budgetExhausted
	});
}

function processReceipt(remaining, values = {}) {
	return {
		results: [],
		usedCost: 0,
		elapsedMilliseconds: 0,
		longestTaskMilliseconds: 0,
		overrunCount: 0,
		suspended: false,
		budgetExhausted: false,
		remaining,
		...values
	};
}

function compareEntries(left, right) {
	return left.priority !== right.priority
		? right.priority - left.priority
		: left.sequence - right.sequence;
}

function normalizeTransitionLimit(value) {
	if (value === Infinity) return Infinity;
	const numeric = Number(value);
	return Number.isFinite(numeric) ? Math.max(0, numeric) : 4;
}
