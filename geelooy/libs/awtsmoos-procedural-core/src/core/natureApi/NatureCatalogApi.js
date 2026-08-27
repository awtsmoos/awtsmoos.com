// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCatalogApi.js
 * @description Unifies discovery across creature species, botanical species, tree presets, and ecological roles.
 * The Awtsmoos is beyond every catalog while every named species remains one finite revelation;
 * Awtsmoos.com gathers those names into a Hod-like communication surface without stealing authority from any specialist catalog.
 */

import {
	creatureSpecies,
	listCreatureSpecies
} from '../animalMesh/creature/CreatureSpeciesCatalog.js';
import {
	ecosystemSpecies,
	listEcosystemSpecies
} from '../ecosystem/EcosystemSpeciesCatalog.js';
import {
	getBotanicalSpecies,
	listBotanicalSpecies
} from '../geometry/generators/botany/BotanicalSpeciesCatalog.js';
import {
	getTreePreset,
	listTreePresets
} from '../geometry/generators/tree/treePresets.js';

const DOMAINS = Object.freeze([
	'creatures',
	'plants',
	'trees',
	'ecosystem'
]);

/**
 * Provides one discoverable read-only catalog facade over authoritative domain catalogs.
 */
export class NatureCatalogApi {
	/** @returns {Array<object>} Known high-level creature species. */
	creatures() {
		return Object.freeze(listCreatureSpecies());
	}

	/** @returns {Array<object>} Known botanical species records. */
	plants() {
		return Object.freeze(listBotanicalSpecies());
	}

	/** @returns {Array<*>} Known canonical tree presets. */
	trees() {
		return Object.freeze(listTreePresets());
	}

	/**
	 * Lists renderer-neutral ecological species, optionally by kind.
	 * @param {string|null} [kind=null] Optional ecosystem kind filter.
	 * @returns {Array<object>} Matching ecological species.
	 */
	ecosystem(kind = null) {
		return Object.freeze(listEcosystemSpecies(kind));
	}

	/**
	 * Resolves one authoritative catalog entry by domain and identifier.
	 * @param {'creatures'|'plants'|'trees'|'ecosystem'} domain Catalog domain.
	 * @param {string} id Domain-specific identifier.
	 * @returns {*} Raw authoritative catalog entry.
	 */
	get(domain, id) {
		if (domain === 'creatures') return creatureSpecies(id);
		if (domain === 'plants') return getBotanicalSpecies(id);
		if (domain === 'trees') return getTreePreset(id);
		if (domain === 'ecosystem') return ecosystemSpecies(id);
		throw new RangeError(
			`B"H | Unknown nature catalog domain "${domain}". Expected: ${DOMAINS.join(', ')}.`
		);
	}

	/**
	 * Searches identifiers across every nature catalog for human-facing discovery.
	 * @param {string} query Case-insensitive identifier fragment.
	 * @returns {Array<{domain: string, id: string, value: *}>} Frozen matching records.
	 */
	search(query) {
		const needle = String(query ?? '').trim().toLowerCase();
		if (!needle) return Object.freeze([]);
		const candidates = [
			...entries('creatures', this.creatures()),
			...entries('plants', this.plants()),
			...entries('trees', this.trees()),
			...entries('ecosystem', this.ecosystem())
		];
		return Object.freeze(candidates.filter(entry => entry.id.toLowerCase().includes(needle)));
	}
}

function entries(domain, values) {
	return values.map(value => {
		const id = typeof value === 'string'
			? value
			: String(value?.id ?? value?.name ?? value?.preset ?? '');
		return Object.freeze({ domain, id, value });
	});
}
