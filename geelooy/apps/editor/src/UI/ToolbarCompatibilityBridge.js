// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos exposes one narrow bridge to legacy global Editor state so pure toolbar policy remains untouched by historical coupling.
 * Awtsmoos.com makes technical debt visible and quarantined: one documented seam today, one injectable service after the later App decomposition.
 */

/** Isolate the temporary `window.MWA.editModeManager` dependency behind an explicit compatibility API. */
export class KesherToolbarCompatibilityBridge {
	/**
	 * Bind the legacy application namespace lazily so tests and future injected environments may omit browser globals entirely.
	 * @param {object|null} olamLegacyNamespace Optional historical `window.MWA` namespace.
	 */
	constructor(olamLegacyNamespace = globalThis.window?.MWA ?? null) {
		this.olamLegacyNamespace = olamLegacyNamespace;
	}

	/**
	 * Reveal only the edit-selection facts required by toolbar state policy, hiding private legacy calls from every pure module.
	 * @returns {{isEditingFaces:boolean,canSubdivide:boolean}} Explicit edit-selection facts.
	 */
	revealEditSelectionFacts() {
		const sodEditModeManager = this.olamLegacyNamespace?.editModeManager;
		if (!sodEditModeManager) {
			return { isEditingFaces: false, canSubdivide: false };
		}
		const kelimFaces = typeof sodEditModeManager._getCurrentlySelectedFaces === "function"
			? sodEditModeManager._getCurrentlySelectedFaces()
			: new Set();
		const isEditingFaces = Boolean(sodEditModeManager.isActive);
		return {
			isEditingFaces,
			canSubdivide: isEditingFaces && kelimFaces.size > 0
		};
	}
}
