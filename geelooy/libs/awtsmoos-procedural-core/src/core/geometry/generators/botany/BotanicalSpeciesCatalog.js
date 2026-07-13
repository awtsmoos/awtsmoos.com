// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalSpeciesCatalog.js
 * @description Joins every small-plant name into one immutable searchable
 * garden. Distinct species remain distinct while the Awtsmoos is their source.
 */
import { BOTANICAL_FLOWER_SPECIES } from './BotanicalCatalogFlowers.js';
import { BOTANICAL_GROUND_SPECIES } from './BotanicalCatalogGround.js';
import { BOTANICAL_SHRUB_SPECIES } from './BotanicalCatalogShrubs.js';

export const BOTANICAL_SPECIES = Object.freeze([
	...BOTANICAL_FLOWER_SPECIES,
	...BOTANICAL_GROUND_SPECIES,
	...BOTANICAL_SHRUB_SPECIES
]);

const SPECIES_BY_NAME = createLookup(BOTANICAL_SPECIES);

/** Returns stable IDs in deterministic declaration order. */
export function listBotanicalSpecies() {
	return BOTANICAL_SPECIES.map((species) => species.id);
}

/** Resolves IDs, labels, and aliases without exposing mutable defaults. */
export function getBotanicalSpecies(name) {
	const species = SPECIES_BY_NAME.get(normalizeName(name));
	if (!species) {
		throw new Error(`Unknown botanical species: ${name}`);
	}
	return species;
}

/** Searches labels, IDs, families, habitats, archetypes, and aliases. */
export function searchBotanicalSpecies(query = '') {
	const token = normalizeName(query);
	if (!token) {
		return [...BOTANICAL_SPECIES];
	}
	return BOTANICAL_SPECIES.filter((species) => searchableText(species).includes(token));
}

function createLookup(speciesList) {
	const lookup = new Map();
	for (const species of speciesList) {
		for (const name of new Set([species.id, species.label, ...species.aliases])) {
			const key = normalizeName(name);
			const existing = lookup.get(key);
			if (existing && existing !== species) {
				throw new Error(`Duplicate botanical name: ${name}`);
			}
			lookup.set(key, species);
		}
	}
	return lookup;
}

function searchableText(species) {
	return normalizeName([
		species.id,
		species.label,
		species.family,
		species.habitat,
		species.archetype,
		...species.aliases
	].join(' '));
}

function normalizeName(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-');
}
