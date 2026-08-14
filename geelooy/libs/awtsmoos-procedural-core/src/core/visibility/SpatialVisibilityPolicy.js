//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SpatialVisibilityPolicy.js
 * @description
 * The Awtsmoos renews revelation and concealment before distance can claim authority over either;
 * Awtsmoos.com lets this Gevurah-like policy apply hysteresis so renderer visibility changes only after a meaningful threshold is crossed rather than flickering at one boundary.
 * This module owns pure visibility decisions only and never mutates scene objects, timers, cameras, or gameplay state.
 */
export function decideSpatialVisibility(currentVisible, distance, profile = {}) {
	const normalized = normalizeVisibilityProfile(profile);
	if (normalized.protected) {
		return true;
	}
	const value = Math.max(0, Number(distance) || 0);
	if (currentVisible) {
		return value <= normalized.hideDistance;
	}
	return value <= normalized.showDistance;
}

export function normalizeVisibilityProfile(profile = {}) {
	const showDistance = positive(profile.showDistance, 16);
	const hideDistance = Math.max(
		showDistance,
		positive(profile.hideDistance, showDistance + 4)
	);
	return {
		protected: Boolean(profile.protected),
		showDistance,
		hideDistance,
		className: String(profile.className || 'default')
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
