// B"H

/** Returns visible state with asymmetric hysteresis around one distance limit. */
export function desiredLodVisibility({
	currentlyVisible,
	alwaysVisible,
	distance,
	maximumDistance,
	hysteresis = 0.12
}) {
	if (alwaysVisible || maximumDistance === Infinity) return true;
	const margin = Math.max(0, Math.min(0.49, hysteresis));
	const threshold = currentlyVisible
		? maximumDistance * (1 + margin)
		: maximumDistance * (1 - margin);
	return distance <= threshold;
}

/** Measures from the observer to the closest point of a bounding sphere. */
export function lodSphereDistance(position, center, radius = 0) {
	return Math.max(0, Math.hypot(
		finiteLodNumber(position?.x) - finiteLodNumber(center?.x),
		finiteLodNumber(position?.y) - finiteLodNumber(center?.y),
		finiteLodNumber(position?.z) - finiteLodNumber(center?.z)
	) - Math.max(0, finiteLodNumber(radius)));
}

/** Near objects appear first; far objects disappear first. */
export function lodTransitionPriority(visible, distance) {
	return visible ? 100000 - distance : distance;
}

export function createInitialLodStats() {
	return {
		registered: 0,
		events: 0,
		evaluations: 0,
		transitions: 0,
		lastTier: null,
		lastEventKey: null
	};
}

export function finiteLodNumber(value, fallback = 0) {
	return Number.isFinite(value) ? value : fallback;
}
