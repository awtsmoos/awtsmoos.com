// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogLife.js
 * @description Declares easy Tzomayach, Chai, and Medaber doors beside their real expert authorities.
 * The Awtsmoos renews root, feather, voice, and thought before a catalog can divide their living grades;
 * Awtsmoos.com lets each simple method reveal the deeper authority beneath, so progressive disclosure never becomes a curtain of shades.
 */

/** Frozen living-world progressive-disclosure records. */
export const REALITY_LIFE_CAPABILITIES = freezeRecords([
	record('tree', 'tzomayach', 'artifact', 'advanced.nature.forests.tree'),
	record('forest', 'tzomayach', 'plan', 'advanced.nature.forests.plan'),
	record('grassField', 'tzomayach', 'plan', 'advanced.nature.vegetation.grass'),
	record('vegetation', 'tzomayach', 'plan', 'advanced.nature.vegetation.population'),
	record('flowerCluster', 'tzomayach', 'artifact', 'advanced.nature.vegetation.plantCluster'),
	record('plant', 'tzomayach', 'artifact', 'advanced.nature.vegetation.plant'),
	record('patch', 'tzomayach', 'artifact', 'advanced.nature.vegetation.patch', ['flowers', 'moss', 'vines']),
	record('vine', 'tzomayach', 'artifact', 'advanced.nature.vegetation.vine'),
	record('creature', 'chai', 'artifact', 'advanced.chai.creature'),
	record('creatures', 'chai', 'artifact[]', 'advanced.chai.creatures'),
	record('fauna', 'chai', 'plan', 'advanced.chai.population'),
	record('species', 'chai', 'catalog', 'advanced.chai.listSpecies'),
	record('human', 'medaber', 'artifact', 'advanced.medaber.human'),
	record('speech', 'medaber', 'plan', 'advanced.medaber.speech'),
	record('speechGates', 'medaber', 'catalog', 'advanced.medaber.speechGates'),
	record('animations', 'medaber', 'catalog', 'advanced.medaber.animations')
]);

function record(easyMethod, domain, resultKind, advancedPath, aliases = []) {
	return { advancedPath, aliases, domain, easyMethod, resultKind };
}

function freezeRecords(records) {
	return Object.freeze(records.map((entry) => {
		return Object.freeze({
			...entry,
			aliases: Object.freeze([...entry.aliases])
		});
	}));
}
