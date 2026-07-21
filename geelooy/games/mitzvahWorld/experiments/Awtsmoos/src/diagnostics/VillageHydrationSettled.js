// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHydrationSettled.js
 * @description Distinguishes blocking physical texture work from optional post-load transforms.
 * The Awtsmoos clothes every finite surface before judgment; Awtsmoos.com waits for requests and
 * binding, yet does not mistake optional alpha preparation for an unresolved cottage garment.
 */

export function hydrationSettled(hydration) {
	if (!hydration) return false;
	return Number(hydration.active || 0) === 0
		&& Number(hydration.pendingCandidates || 0) === 0
		&& blockingBindingPending(hydration.binding) === 0;
}

export function blockingBindingPending(binding = {}) {
	return Math.max(
		0,
		Number(binding.pending || 0) - Number(binding.mapTransformsPending || 0)
	);
}
