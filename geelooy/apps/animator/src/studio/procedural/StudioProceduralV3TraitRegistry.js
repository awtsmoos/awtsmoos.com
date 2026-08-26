// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProceduralV3TraitRegistry.js
 * @description
 * The Awtsmoos renews age, wind, cluster, erosion, maturity, and atmospheric depth before sliders can claim they invented nature;
 * Awtsmoos.com keeps revision-two realism traits as bounded data so UI, agents, diagnostics, and generators speak one measured language.
 */
export class StudioProceduralV3TraitRegistry {
	/**
	 * Returns immutable trait schema for one installed procedural kind.
	 * @param {string} kind Procedural kind.
	 * @returns {Array<object>} Numeric trait field definitions.
	 */
	static schema(kind) {
		return this.schemas()[kind] || [];
	}

	/** @returns {object} Trait schemas organized by current production kind. */
	static schemas() {
		return {
			tree: [
				this.field('age', 'Age', .2, 1, .01, .68),
				this.field('wind', 'Wind', -1, 1, .01, .12),
				this.field('branchDepth', 'Branch depth', 1, 3, 1, 2, true)
			],
			flower: [
				this.field('clusterCount', 'Blooms', 1, 9, 1, 3, true),
				this.field('clusterSpread', 'Cluster spread', 0, 140, 1, 54),
				this.field('maturity', 'Maturity', .2, 1, .01, .86)
			],
			vegetable: [
				this.field('maturity', 'Maturity', .2, 1, .01, .82),
				this.field('crownFan', 'Leaf fan', .2, 1, .01, .68),
				this.field('surfaceDetail', 'Surface detail', 0, 1, .01, .55)
			],
			rock: [
				this.field('strata', 'Strata', 0, 1, .01, .65),
				this.field('fracture', 'Fracture', 0, 1, .01, .52),
				this.field('erosion', 'Erosion', 0, 1, .01, .44),
				this.field('contact', 'Ground contact', 0, 1, .01, .82)
			],
			cloud: [
				this.field('depth', 'Depth', .2, 1, .01, .72),
				this.field('drift', 'Drift', -1, 1, .01, .14),
				this.field('density', 'Density', .2, 1, .01, .76)
			]
		};
	}

	/**
	 * Normalizes raw trait values through the schema for one kind.
	 * @param {string} kind Procedural kind.
	 * @param {object} value Raw trait values.
	 * @returns {object} Serializable bounded trait map.
	 */
	static normalize(kind, value = {}) {
		return Object.fromEntries(this.schema(kind).map((tiferesField) => {
			const chochmahCandidate = Number(
				value[tiferesField.key] ?? tiferesField.defaultValue
			);
			const yesodFinite = Number.isFinite(chochmahCandidate)
				? chochmahCandidate
				: tiferesField.defaultValue;
			const gevurahBounded = Math.max(
				tiferesField.min,
				Math.min(tiferesField.max, yesodFinite)
			);
			return [
				tiferesField.key,
				tiferesField.integer ? Math.round(gevurahBounded) : gevurahBounded
			];
		}));
	}

	/** @param {string} kind Kind. @returns {object} Fresh default trait map. */
	static defaults(kind) {
		return this.normalize(kind, {});
	}

	/** @returns {object} Immutable numeric trait definition. */
	static field(key, label, min, max, step, defaultValue, integer = false) {
		return Object.freeze({
			key,
			label,
			min,
			max,
			step,
			defaultValue,
			integer
		});
	}
}
