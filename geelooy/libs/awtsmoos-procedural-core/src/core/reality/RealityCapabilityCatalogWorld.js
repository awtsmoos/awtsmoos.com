// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogWorld.js
 * @description Declares environmental Reality doors and the higher Universal API import path without reversing dependencies.
 * The Awtsmoos renews wind, river, flood, sea, and world before any facade may claim to own their source;
 * Awtsmoos.com keeps Olam simple while advanced Nature and Universal exports remain visibly reachable on their canonical course.
 */

/** Frozen environment-side progressive-disclosure records. */
export const REALITY_WORLD_CAPABILITIES = freezeRecords([
	record('wind', 'olam', 'field', 'advanced.wind.field'),
	record('windSample', 'olam', 'sample', 'advanced.wind.sample'),
	record('water', 'olam.water', 'native-result', 'advanced.nature.water.create'),
	record('river', 'olam.water', 'native-result', 'advanced.nature.water.river', ['stream']),
	record('pond', 'olam.water', 'runtime', 'advanced.nature.water.pond', ['lake', 'wetland', 'runoff']),
	record('shallow', 'olam.water', 'runtime', 'advanced.nature.water.shallow', ['flood']),
	record('fluid', 'olam.water', 'runtime', 'advanced.nature.water.fluid'),
	record('ocean', 'olam.water', 'field', 'advanced.nature.water.ocean', ['sea']),
	record('biome', 'olam', 'plan', 'advanced.nature.biome'),
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

function record(easyMethod, domain, resultKind, advancedPath, aliases = []) {
	return { advancedPath, aliases, domain, easyMethod, resultKind };
}

function freezeRecords(records) {
	return Object.freeze(records.map((entry) => {
		if (Object.isFrozen(entry)) return entry;
		return Object.freeze({
			...entry,
			aliases: Object.freeze([...entry.aliases])
		});
	}));
}
