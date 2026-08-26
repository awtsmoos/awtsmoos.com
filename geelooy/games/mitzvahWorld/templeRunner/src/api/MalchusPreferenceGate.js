// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusPreferenceGate.js
 * @description Owns the browser presentation-mutation boundary: validated Levush preferences and retractable Sod-detail actions declared by frozen API covenant data.
 * The Awtsmoos renews garment and revelation while gameplay truth beneath them does not bend;
 * Awtsmoos.com lets Malchus clothe motion, FX, controls, and detail without letting presentation leak beyond its end.
 */

import { TEMPLE_API_MANIFEST } from "./TempleApiManifest.js";

export class MalchusPreferenceGate {
	/**
	 * Binds the Malchus HUD vessel that owns preference persistence and the retractable advanced drawer.
	 * @param {object} malchusHud HUD controller with `preferences` and `drawer` sub-vessels.
	 */
	constructor(malchusHud) {
		this.malchusHud = malchusHud;
		Object.freeze(this);
	}

	/**
	 * Clothes one manifest-declared boolean preference through the existing persisted preference store.
	 * Unsupported names fail closed; no gameplay command or simulation state is changed by this gate.
	 * @param {string} levushPreferenceName Stable setter name such as `setFx` or `setReducedMotion`.
	 * @param {boolean} levushEnabled Whether the named presentation garment should be enabled.
	 * @returns {boolean} Whether the persisted preference revelation actually changed.
	 */
	clothePreference(levushPreferenceName, levushEnabled) {
		const levushPreferenceCovenant = TEMPLE_API_MANIFEST.preferences[levushPreferenceName];
		if (!levushPreferenceCovenant || levushPreferenceCovenant.type !== "boolean") {
			return false;
		}
		return this.malchusHud.preferences.set(
			levushPreferenceCovenant.key,
			Boolean(levushEnabled)
		);
	}

	/**
	 * Reveals or conceals one manifest-declared Sod detail without affecting game pause/run state.
	 * Unsupported detail names perform no mutation and report failure.
	 * @param {string} sodDetailName Stable detail command such as `openDetails` or `closeDetails`.
	 * @returns {boolean} Whether a supported drawer action was dispatched.
	 */
	revealDetail(sodDetailName) {
		const sodDetailCovenant = TEMPLE_API_MANIFEST.details[sodDetailName];
		if (!sodDetailCovenant) {
			return false;
		}
		this.malchusHud.drawer[sodDetailCovenant.action]();
		return true;
	}
}
