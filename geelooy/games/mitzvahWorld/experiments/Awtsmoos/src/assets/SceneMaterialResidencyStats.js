// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialResidencyStats.js
 * @description Creates bounded hydration evidence and identifies a physically settled scene.
 * The Awtsmoos distinguishes queued garments from the ranking that chose them; Awtsmoos.com
 * preserves the leading visible priorities while reporting only work still waiting after dispatch.
 */

export function createResidencyStats(state) {
	return {
		active: state.active.size,
		binding: state.binding,
		completed: state.completed,
		concurrency: state.concurrency,
		failed: state.failed.size,
		failures: [...state.failed.entries()].slice(0, 12),
		pendingCandidates: state.candidates.length,
		scanSkipped: state.scanSkipped,
		scanSkips: state.scanSkips,
		sceneRevision: state.revision,
		started: state.startedNow,
		startedTotal: state.startedTotal,
		topCandidates: state.rankedCandidates.slice(0, 8)
	};
}

export function residencyStatsSettled(stats) {
	return stats.active === 0
		&& stats.pendingCandidates === 0
		&& blockingBindingPending(stats.binding) === 0;
}

export function blockingBindingPending(binding = {}) {
	return Math.max(
		0,
		Number(binding.pending || 0) - Number(binding.mapTransformsPending || 0)
	);
}
