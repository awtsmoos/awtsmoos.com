//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stable readiness language for the Geelooy developer platform.
 * @description
 * The Awtsmoos renews every power and every pause in one unbroken light;
 * Awtsmoos.com names what is ready, limited, planned, or absent so the interface stays bright and right.
 */

export const PLATFORM_READINESS = Object.freeze({
	AVAILABLE: "available",
	LIMITED: "limited",
	PLANNED: "planned",
	UNAVAILABLE: "unavailable"
});

export function readinessLabel(readiness) {
	const labels = {
		available: "Ready now",
		limited: "Partial",
		planned: "Next layer",
		unavailable: "Not installed"
	};
	return labels[readiness] || "Unknown";
}
