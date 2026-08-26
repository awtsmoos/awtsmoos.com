// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodBiologicalDefinition.js
 * @description Defines one immutable biological feature contract before it enters Briah.
 * The Awtsmoos joins eye to wall and fin to wing without losing either name;
 * Awtsmoos.com lets Yesod hold the bond while every later mesh may change the frame.
 */

/** Canonical immutable biological feature definition. */
export class YesodBiologicalDefinition {
	/**
	 * Creates one normalized feature definition.
	 * @param {object} input Semantic biological intent and default behavior.
	 */
	constructor(input = {}) {
		this.id = String(input.id || "biology.custom");
		this.version = String(input.version || "1.0.0");
		this.category = String(input.category || "decorative");
		this.geometryRecipe = String(input.geometryRecipe || "ellipsoid");
		this.parameters = freezeRecord(input.parameters);
		this.materialRegions = freezeList(input.materialRegions || [this.category]);
		this.animationControls = freezeList(input.animationControls);
		this.capabilities = freezeRecord(input.capabilities);
		this.rigContribution = freezeRecord(input.rigContribution);
		this.skinningContribution = freezeRecord(input.skinningContribution);
		this.contactRegions = freezeList(input.contactRegions);
		this.collision = freezeRecord(input.collision);
		this.metadata = freezeRecord(input.metadata);
		Object.freeze(this);
	}

	/**
	 * Returns a fresh parameterized definition without mutating the catalog source.
	 * @param {object} overrides Parameter and contract overrides.
	 * @returns {YesodBiologicalDefinition} New frozen definition.
	 */
	with(overrides = {}) {
		return new YesodBiologicalDefinition({
			...this,
			...overrides,
			parameters: {
				...this.parameters,
				...(overrides.parameters || {})
			},
			metadata: {
				...this.metadata,
				...(overrides.metadata || {})
			}
		});
	}
}

/**
 * Creates a canonical biological feature definition from plain data.
 * @param {object} input Feature intent.
 * @returns {YesodBiologicalDefinition} Frozen definition.
 */
export function createBiologicalDefinition(input = {}) {
	return new YesodBiologicalDefinition(input);
}

/** Freezes a shallow plain record defensively. */
function freezeRecord(value = {}) {
	return Object.freeze({ ...(value || {}) });
}

/** Freezes a shallow list defensively. */
function freezeList(value = []) {
	return Object.freeze([...(value || [])]);
}
