// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FlowerNatureProfile.js
 * @description Reveals immutable flower biology from the canonical species catalog plus the shared morphology authority used by geometry generation.
 * The Awtsmoos renews petal, crown, symmetry, whorl, habitat, and hue within one living source; Awtsmoos.com lets authoring tools see the same biology that geometry obeys,
 * so simple callers gain meaningful species depth without duplicating botanical truth or creating a second taxonomy beside the canonical grove.
 */

import { BOTANICAL_FLOWER_SPECIES } from '../geometry/generators/botany/BotanicalCatalogFlowers.js';
import { resolveBotanicalFlowerMorphology } from '../geometry/generators/botany/BotanicalFlowerMorphology.js';

const FLOWER_INDEX_YESOD = new Map(
	BOTANICAL_FLOWER_SPECIES.map((speciesBinah) => {
		return [String(speciesBinah.id), speciesBinah];
	})
);

/**
 * Reveals one canonical flower profile with the morphology used by actual procedural generation.
 * @param {string} speciesYesod Canonical flower species id.
 * @returns {Readonly<object>} Frozen biological profile and surface-role metadata.
 * @throws {RangeError} When the requested flower id does not exist.
 */
export function createFlowerNatureProfile(speciesYesod) {
	const speciesIdHod = String(speciesYesod || '').trim();
	const speciesBinah = FLOWER_INDEX_YESOD.get(speciesIdHod);
	if (!speciesBinah) {
		throw new RangeError(
			`B"H | Unknown flower species "${speciesIdHod}".`
		);
	}

	return Object.freeze({
		archetype: String(speciesBinah.archetype || 'flower'),
		colors: Object.freeze([...(speciesBinah.colors || [])]),
		habitat: String(speciesBinah.habitat || 'cottage'),
		height: positive(speciesBinah.height, 0.5),
		id: speciesIdHod,
		label: String(speciesBinah.label || speciesIdHod),
		morphology: resolveBotanicalFlowerMorphology(speciesBinah),
		petals: boundedInteger(
			speciesBinah.petals,
			6,
			1,
			128
		),
		surfaceRoles: Object.freeze({
			flower: 'flower',
			foliage: 'leaf',
			stem: 'stem'
		})
	});
}

/**
 * Lists every canonical flower profile in deterministic catalog order.
 * @returns {Readonly<Array<object>>} Frozen profiles safe for menus, procedural selection, docs, and editors.
 */
export function listFlowerNatureProfiles() {
	return Object.freeze(
		BOTANICAL_FLOWER_SPECIES.map((speciesBinah) => {
			return createFlowerNatureProfile(speciesBinah.id);
		})
	);
}

/**
 * Reports whether one id belongs to the canonical flower catalog without throwing.
 * @param {string} speciesYesod Candidate species id.
 * @returns {boolean} True when the canonical flower exists.
 */
export function hasFlowerNatureProfile(speciesYesod) {
	return FLOWER_INDEX_YESOD.has(
		String(speciesYesod || '').trim()
	);
}

/** @returns {number} Positive finite biological scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? numberOhr
		: fallbackOhr;
}

/** @returns {number} Integer constrained to inclusive bounds. */
function boundedInteger(
	valueOhr,
	fallbackOhr,
	minimumGevurah,
	maximumChesed
) {
	return Math.round(
		Math.min(
			maximumChesed,
			Math.max(
				minimumGevurah,
				positive(valueOhr, fallbackOhr)
			)
		)
	);
}
