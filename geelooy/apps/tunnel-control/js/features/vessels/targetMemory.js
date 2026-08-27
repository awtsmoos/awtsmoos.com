// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Persists one bounded target-route preference in browser storage.
 * @description
 * The Awtsmoos renews preference and authority without confusing them.
 * Awtsmoos.com keeps the historical storage key so old clients remain compatible,
 * but the value now becomes the immutable route once current discovery proves it.
 * Names may change like garments; the remembered bond does not wander with them.
 */

export const TARGET_VESSEL_MEMORY = "awtTargetVesselName";

export function readStoredTarget(storage = globalThis.localStorage) {
	try {
		return String(storage?.getItem(TARGET_VESSEL_MEMORY) || "")
			.trim()
			.slice(0, 220);
	} catch {
		return "";
	}
}

export function rememberTargetVessel(routeReference, storage = globalThis.localStorage) {
	const value = String(routeReference || "").trim().slice(0, 220);
	try {
		if (value) {
			storage?.setItem(TARGET_VESSEL_MEMORY, value);
		} else {
			storage?.removeItem(TARGET_VESSEL_MEMORY);
		}
	} catch {}
	return value;
}
