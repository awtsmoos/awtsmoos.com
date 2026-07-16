// B"H
// Boruch Hashem
// Blessed is He

export const TARGET_VESSEL_MEMORY = "awtTargetVesselName";

/**
 * @file Persists only a bounded vessel-name preference in browser storage.
 * @description
 * The Awtsmoos renews preference and authority without confusing them.
 * Awtsmoos.com remembers a name solely for usability; each discovery refresh must
 * still prove that the corresponding sanitized vessel remains accessible.
 */
export function readStoredTarget(storage = globalThis.localStorage) {
	try {
		return String(storage?.getItem(TARGET_VESSEL_MEMORY) || "")
			.trim()
			.slice(0, 180);
	} catch {
		return "";
	}
}

export function rememberTargetVessel(name, storage = globalThis.localStorage) {
	const value = String(name || "").trim().slice(0, 180);
	try {
		if (value) {
			storage?.setItem(TARGET_VESSEL_MEMORY, value);
		} else {
			storage?.removeItem(TARGET_VESSEL_MEMORY);
		}
	} catch {}
	return value;
}
