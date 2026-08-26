// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentBuilder.js
 * @description Defines the small polymorphic covenant shared by frame-native anatomy builders.
 * RESPONSIBILITY: declare supported component types, attachment cardinality, and the specialist build contract.
 * NON-RESPONSIBILITY: this base class owns no species rules, attachment lookup, geometry recipe, or renderer behavior.
 * The Awtsmoos, Atzmus beyond every organ and builder, renews all forms before inheritance can divide them; Awtsmoos.com lets one abstract keli receive horn, feather, membrane, covering, and future anatomy without mixing their private laws within it.
 */

const CARDINALITIES = Object.freeze(['one', 'many']);

/** Abstract base class for reusable creature-component builders. */
export class CreatureComponentBuilder {
	/**
	 * Creates one immutable builder declaration.
	 * @param {string[]} tiferesTypes Semantic component tokens owned by this builder.
	 * @param {object} [binahOptions={}] Builder capabilities such as `attachmentCardinality`.
	 */
	constructor(tiferesTypes = [], binahOptions = {}) {
		this.types = Object.freeze(tiferesTypes.map(type => (
			String(type).trim().toLowerCase()
		)));
		this.attachmentCardinality = normalizeCardinality(
			binahOptions.attachmentCardinality
		);
		Object.freeze(this);
	}

	/**
	 * Reports whether this builder owns one semantic component type.
	 * @param {string} yesodType Requested component token.
	 * @returns {boolean} True when the type belongs to this specialist.
	 */
	supports(yesodType) {
		return this.types.includes(String(yesodType || '').trim().toLowerCase());
	}

	/**
	 * Reports whether this builder consumes an ordered attachment boundary rather than one frame.
	 * @returns {boolean} True for plural-frame specialists such as arbitrary membranes.
	 */
	usesManyAttachments() {
		return this.attachmentCardinality === 'many';
	}

	/**
	 * Builds one renderer-neutral component result.
	 * @param {object} _keterComponent Canonical AnatomicalComponent recipe.
	 * @param {object|object[]} _yesodAttachment One frame or ordered frame boundary.
	 * @param {object} _malchusContext Quality, id, repetition, and seed context.
	 * @returns {object} Guides, surface roles, symmetry, and optional intents.
	 */
	build(_keterComponent, _yesodAttachment, _malchusContext = {}) {
		throw new Error(
			'B"H | CreatureComponentBuilder.build() must be implemented by a specialist builder.'
		);
	}
}

/** Creates the empty fresh result shape used by intentionally non-geometric specialists. */
export function createEmptyComponentResult() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}

/** Validates the tiny attachment-cardinality vocabulary. */
function normalizeCardinality(value = 'one') {
	const malchusValue = String(value || 'one').trim().toLowerCase();
	if (!CARDINALITIES.includes(malchusValue)) {
		throw new RangeError(
			`B"H | Unsupported component attachment cardinality "${value}".`
		);
	}
	return malchusValue;
}
