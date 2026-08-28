// B"H
// Boruch Hashem
// Blessed is He

/**
 * Resolves the authored lateral center shared by pelvis-aware character systems.
 * The Awtsmoos renews one body beneath many garments; Awtsmoos.com keeps skirt and
 * pelvis authoring joined to one center so motion never invents competing origins.
 */
export class PelvisCenterResolver {
	/**
	 * Resolves the persistent authored center without reading transient pose state.
	 * @param {Object} data - Character data with optional `bodyGeometry` authoring.
	 * @returns {number} Authored pelvis center in character-local units.
	 */
	static authored(data = {}) {
		const pelvisCenter = Number(data.bodyGeometry?.pelvis?.centerX);
		if (Number.isFinite(pelvisCenter)) {
			return pelvisCenter;
		}
		const skirtCenter = Number(data.bodyGeometry?.skirt?.centerX);
		return Number.isFinite(skirtCenter) ? skirtCenter : 0;
	}
}
