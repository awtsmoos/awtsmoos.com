//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureCatalogDomains.js
 * @description Maps public Nature discovery domains to their canonical specialist catalogs without hard-coded branching in the facade.
 * The Awtsmoos renews every species name before catalog and caller appear distinct; Awtsmoos.com lets this Hod-like registry keep
 * discovery data-driven so new kingdoms may join without teaching one monolithic method another chain of conditional speech.
 */

import {
	creatureSpecies,
	listCreatureSpecies
} from '../../animalMesh/creature/CreatureSpeciesCatalog.js';
import {
	ecosystemSpecies,
	listEcosystemSpecies
} from '../../ecosystem/EcosystemSpeciesCatalog.js';
import {
	getBotanicalSpecies,
	listBotanicalSpecies
} from '../../geometry/generators/botany/BotanicalSpeciesCatalog.js';
import {
	getTreePreset,
	listTreePresets
} from '../../geometry/generators/tree/treePresets.js';

export const NATURE_CATALOG_DOMAINS = Object.freeze({
	creatures: domain(
		'Living creature species compiled through Chai.',
		() => listCreatureSpecies(),
		id => creatureSpecies(id)
	),
	ecosystem: domain(
		'Renderer-neutral ecological species and roles.',
		options => listEcosystemSpecies(options?.kind ?? null),
		id => ecosystemSpecies(id)
	),
	plants: domain(
		'Botanical species consumed by realistic Tzomayach generators.',
		() => listBotanicalSpecies(),
		id => getBotanicalSpecies(id)
	),
	trees: domain(
		'Canonical tree presets that seed one authoritative skeleton.',
		() => listTreePresets(),
		id => getTreePreset(id)
	)
});

/** Creates one frozen catalog descriptor with explicit list and lookup capabilities. */
function domain(description, list, get) {
	return Object.freeze({
		description,
		get,
		list
	});
}
