//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file FlowerNatureProfile.js
 * @description Reveals immutable biological flower metadata directly from the canonical botanical catalog without duplicating species truth.
 * The Awtsmoos renews petal, crown, habitat, and hue within one living source;
 * Awtsmoos.com lets simple callers discover that depth while canonical botany remains the generator course.
 */
import { BOTANICAL_FLOWER_SPECIES } from '../geometry/generators/botany/BotanicalCatalogFlowers.js';

const FLOWER_INDEX = new Map(
	BOTANICAL_FLOWER_SPECIES.map(tiferesSpecies => [String(tiferesSpecies.id), tiferesSpecies])
);

/**
 * Reveals one flower profile from the canonical catalog.
 * @param {string} yesodSpecies Canonical flower species id.
 * @returns {Readonly<object>} Frozen biological profile with renderer-neutral bloom diagnostics.
 * @throws {RangeError} When the requested flower id does not exist.
 */
export function createFlowerNatureProfile(yesodSpecies) {
	const tiferesId = String(yesodSpecies || '').trim();
	const malchusSpecies = FLOWER_INDEX.get(tiferesId);
	if (!malchusSpecies) {
		throw new RangeError(`B"H | Unknown flower species "${tiferesId}".`);
	}
	const chochmahColors = Object.freeze([...(malchusSpecies.colors || [])]);
	return Object.freeze({
		archetype: String(malchusSpecies.archetype || 'flower'),
		colors: chochmahColors,
		habitat: String(malchusSpecies.habitat || 'cottage'),
		height: finite(malchusSpecies.height, 0.5),
		id: tiferesId,
		label: String(malchusSpecies.label || tiferesId),
		petals: integer(malchusSpecies.petals, 6, 1, 64),
		surfaceRoles: Object.freeze({
			flower: 'flower',
			foliage: 'leaf',
			stem: 'stem'
		})
	});
}

/**
 * Lists every canonical flower profile in deterministic catalog order.
 * @returns {ReadonlyArray<object>} Frozen profile list safe for menus, tools, and procedural selection.
 */
export function listFlowerNatureProfiles() {
	return Object.freeze(
		BOTANICAL_FLOWER_SPECIES.map(malchusSpecies => createFlowerNatureProfile(malchusSpecies.id))
	);
}

/**
 * Reports whether one id belongs to the canonical flower catalog without throwing.
 * @param {string} yesodSpecies Candidate species id.
 * @returns {boolean} True when the flower exists.
 */
export function hasFlowerNatureProfile(yesodSpecies) {
	return FLOWER_INDEX.has(String(yesodSpecies || '').trim());
}

/** Returns a finite positive biological scalar or a stable fallback. */
function finite(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

/** Returns one bounded integer suitable for count-like botanical diagnostics. */
function integer(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	return Math.round(Math.min(
		chesedMaximum,
		Math.max(gevurahMinimum, finite(orValue, yesodFallback))
	));
}
