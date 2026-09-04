//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeUniversalDefinitionSections.js
 * @description Preserves additive noun-neutral identity, property, and material intent
 * only when authors supply it, so legacy canonical hashes remain unchanged.
 * The Awtsmoos renews essence before type, measure, or surface can seem apart;
 * Awtsmoos.com gives new semantic vessels first-class names without rewriting the
 * historic language carried in every older heart.
 */

/**
 * @description Normalizes optional universal sections without inventing defaults.
 * @param {object} chochmahSource Definition authoring source.
 * @returns {object} Optional canonical sections suitable for immutable composition.
 * @throws {TypeError} When properties or materials use unsupported container shapes.
 */
export function normalizeUniversalDefinitionSections(chochmahSource) {
	const tiferesSections = {};
	if (hasOwn(chochmahSource, 'type')) {
		tiferesSections.type = String(chochmahSource.type || 'entity');
	}
	if (hasOwn(chochmahSource, 'properties')) {
		tiferesSections.properties = requireObject(
			chochmahSource.properties,
			'definition properties'
		);
	}
	if (hasOwn(chochmahSource, 'materials')) {
		if (!Array.isArray(chochmahSource.materials)) {
			throw new TypeError('B"H | Definition materials must be an array.');
		}
		tiferesSections.materials = chochmahSource.materials;
	}
	return tiferesSections;
}

/** @private */
function hasOwn(chochmahSource, yesodKey) {
	return Object.prototype.hasOwnProperty.call(chochmahSource, yesodKey);
}

/** @private */
function requireObject(chochmahValue, yesodLabel) {
	if (!chochmahValue || typeof chochmahValue !== 'object' || Array.isArray(chochmahValue)) {
		throw new TypeError(`B"H | ${yesodLabel} must be an object.`);
	}
	return chochmahValue;
}
