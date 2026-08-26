//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogWorld.js
 * @description Declares professional wind, water, terrain, biome, and package-export capabilities with explicit runtime-vs-portable projection boundaries.
 * The Awtsmoos renews atmosphere, current, mountain, valley, and world before finite facades can claim their source;
 * Awtsmoos.com keeps native fields alive while JSON receives truthful samples, plans, descriptions, catalogs, or metadata according to each vessel's course.
 */
import {
	createRealityExportCapability,
	createRealityMethodCapability,
	freezeRealityCapabilityRecords
} from './RealityCapabilityRecord.js';

const PROFILED = Object.freeze({ quality: true, realism: true, seed: true });
const QUALITY_SEEDED = Object.freeze({ quality: true, realism: false, seed: true });
const DISCOVERY = Object.freeze({ quality: false, realism: false, seed: false });

/** Frozen environmental progressive-disclosure covenant records. */
export const REALITY_WORLD_CAPABILITIES = freezeRealityCapabilityRecords([
	method('wind', 'olam', 'field', 'advanced.wind.field', {
		jsonProjection: 'describe',
		supports: QUALITY_SEEDED
	}),
	method('windSample', 'olam', 'sample', 'advanced.wind.sample', { supports: QUALITY_SEEDED }),
	method('water', 'olam.water', 'native-result', 'advanced.nature.water.create', {
		jsonProjection: 'plan',
		supports: PROFILED
	}),
	method('river', 'olam.water', 'native-result', 'advanced.nature.water.river', {
		aliases: ['stream'],
		jsonProjection: 'plan',
		supports: PROFILED
	}),
	method('pond', 'olam.water', 'runtime', 'advanced.nature.water.pond', {
		aliases: ['lake', 'wetland', 'runoff'],
		supports: PROFILED
	}),
	method('shallow', 'olam.water', 'runtime', 'advanced.nature.water.shallow', {
		aliases: ['flood'],
		supports: PROFILED
	}),
	method('fluid', 'olam.water', 'runtime', 'advanced.nature.water.fluid', { supports: PROFILED }),
	method('ocean', 'olam.water', 'field', 'advanced.nature.water.ocean', {
		aliases: ['sea'],
		jsonProjection: 'native-only',
		supports: PROFILED
	}),
	method('terrain', 'olam.terrain', 'plan', 'terrainOlam.plan', {
		aliases: ['landscape', 'landform', 'worldTerrain'],
		supports: QUALITY_SEEDED
	}),
	method('terrainCatalog', 'olam.terrain', 'catalog', 'terrainOlam.catalog', { supports: DISCOVERY }),
	method('biome', 'olam', 'plan', 'advanced.nature.biome', { supports: PROFILED }),
	createRealityExportCapability({
		advancedExports: ['createUniversalAwtsmoosApi', 'createRuntimeApi', 'MethodRegistry', 'EventBus', 'History'],
		description: 'Package-level Universal API export surface; JSON exposes metadata while the native module owns runtime execution.',
		domain: 'universalApi',
		exportName: 'createUniversalAwtsmoosApi',
		jsonProjection: 'metadata',
		resultKind: 'stateful-api'
	})
]);

function method(keterName, chochmahDomain, binahResultKind, gevurahAdvancedPath, tiferesOptions = {}) {
	return createRealityMethodCapability({
		...tiferesOptions,
		advancedPath: gevurahAdvancedPath,
		description: `${keterName} ${chochmahDomain} capability with explicit native and JSON projection policy.`,
		domain: chochmahDomain,
		name: keterName,
		resultKind: binahResultKind
	});
}
