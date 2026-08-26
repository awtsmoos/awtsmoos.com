// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogWorld.js
 * @description Declares environmental Reality doors for wind, water, terrain, biomes, and the higher Universal API without reversing dependencies.
 * The Awtsmoos renews atmosphere, river, mountain, valley, and world before any facade can claim to own their source;
 * Awtsmoos.com keeps Olam discoverable through small semantic doors while advanced authorities remain visible along their canonical course.
 */

/** Frozen environment-side progressive-disclosure records. */
export const REALITY_WORLD_CAPABILITIES = freezeRecords([
	createCapabilityRecord('wind', 'olam', 'field', 'advanced.wind.field'),
	createCapabilityRecord('windSample', 'olam', 'sample', 'advanced.wind.sample'),
	createCapabilityRecord('water', 'olam.water', 'native-result', 'advanced.nature.water.create'),
	createCapabilityRecord('river', 'olam.water', 'native-result', 'advanced.nature.water.river', ['stream']),
	createCapabilityRecord('pond', 'olam.water', 'runtime', 'advanced.nature.water.pond', ['lake', 'wetland', 'runoff']),
	createCapabilityRecord('shallow', 'olam.water', 'runtime', 'advanced.nature.water.shallow', ['flood']),
	createCapabilityRecord('fluid', 'olam.water', 'runtime', 'advanced.nature.water.fluid'),
	createCapabilityRecord('ocean', 'olam.water', 'field', 'advanced.nature.water.ocean', ['sea']),
	createCapabilityRecord('terrain', 'olam.terrain', 'plan', 'terrainOlam.plan', ['landscape', 'landform', 'worldTerrain']),
	createCapabilityRecord('terrainCatalog', 'olam.terrain', 'catalog', 'terrainOlam.catalog'),
	createCapabilityRecord('biome', 'olam', 'plan', 'advanced.nature.biome'),
	Object.freeze({
		advancedExports: Object.freeze([
			'createUniversalAwtsmoosApi',
			'createRuntimeApi',
			'MethodRegistry',
			'EventBus',
			'History'
		]),
		domain: 'universalApi',
		easyExport: 'createUniversalAwtsmoosApi',
		resultKind: 'stateful-api'
	})
]);

/**
 * Creates one explicit capability descriptor consumed by the unified Reality catalog.
 * @param {string} easyMethodMalchus Public beginner method exposed by RealityApi.
 * @param {string} domainBinah Semantic domain used for filtering and documentation.
 * @param {string} resultKindHod Portable result category returned by the method.
 * @param {string} advancedPathYesod Specialist authority path for progressive disclosure.
 * @param {Array<string>} [aliasesNetzach=[]] Alternative discovery words without new public methods.
 * @returns {object} Mutable descriptor that becomes immutable when the catalog is sealed.
 */
function createCapabilityRecord(
	easyMethodMalchus,
	domainBinah,
	resultKindHod,
	advancedPathYesod,
	aliasesNetzach = []
) {
	return {
		advancedPath: advancedPathYesod,
		aliases: aliasesNetzach,
		domain: domainBinah,
		easyMethod: easyMethodMalchus,
		resultKind: resultKindHod
	};
}

/**
 * Deep-freezes descriptor aliases and records so discovery metadata cannot become hidden runtime state.
 * @param {Array<object>} recordsOros Capability descriptors to seal.
 * @returns {Readonly<Array<object>>} Frozen capability descriptor collection.
 */
function freezeRecords(recordsOros) {
	return Object.freeze(recordsOros.map((recordKli) => {
		if (Object.isFrozen(recordKli)) {
			return recordKli;
		}
		return Object.freeze({
			...recordKli,
			aliases: Object.freeze([...(recordKli.aliases || [])])
		});
	}));
}
