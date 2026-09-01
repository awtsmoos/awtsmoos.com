// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainHydration.js
 * @description Loads remote terrain after first play and binds genuine grass over the generated bootstrap surface.
 * The Awtsmoos reveals walkable earth before the distant garment arrives, yet never mistakes the placeholder for the destination;
 * Awtsmoos.com lets one preferred grass ray replace generated pixels while truthful diagnostics record the completed hydration.
 */

import {
	bindBootstrapTerrainRecord,
	bindBootstrapTerrainRole
} from './BootstrapTerrainRemoteBinding.js';

const TERRAIN_SOURCES_URL = new URL(
	'./MinimalMeadowTerrainSources.js?v=20260901-real-grass-01',
	import.meta.url
).href;

export function createBootstrapTerrainHydration(group, stats, importer = null) {
	let promise = null;
	const state = { error: null, failed: 0, loaded: 0, phase: 'deferred' };
	stats.textureSources = deferredSourceEvidence();
	const diagnostics = () => Object.freeze({ ...state });
	const start = () => {
		promise ||= hydrate(group, stats, state, importer).catch(error => {
			state.error = error?.message || String(error);
			state.phase = 'degraded';
			return diagnostics();
		});
		return promise;
	};
	return Object.freeze({ diagnostics, start });
}

async function hydrate(group, stats, state, importer) {
	state.phase = 'loading';
	const module = await resolveTerrainModule(importer);
	publishImmediateCatalog(stats, module);
	const preferredUrl = module.TEXTURES?.grassFour || '';
	const sources = await module.loadMinimalMeadowTerrainSources({
		onTextureSettled(record) {
			bindBootstrapTerrainRecord(group, record, preferredUrl);
		}
	});
	stats.textureSources = sourceEvidence(sources);
	const bound = bindBootstrapTerrainRole(group, sources, 'grassFour');
	state.error = bound ? null : 'Preferred remote grass did not bind to visible terrain.';
	state.failed = sources.failed || 0;
	state.loaded = sources.loaded || 0;
	state.phase = bound ? (sources.mode || 'ready') : 'degraded';
	return Object.freeze({ ...state });
}

function resolveTerrainModule(importer) {
	const load = importer || (specifier => import(specifier));
	return load(TERRAIN_SOURCES_URL);
}

function publishImmediateCatalog(stats, module) {
	const snapshot = module.createMinimalMeadowTerrainSourceSnapshot?.();
	if (snapshot) stats.textureSources = sourceEvidence(snapshot);
}

function sourceEvidence(sources) {
	return Object.freeze({
		mode: sources.mode,
		records: sources.records,
		transport: sources.transport,
		urls: sources.urls
	});
}

function deferredSourceEvidence() {
	return Object.freeze({
		mode: 'deferred',
		records: Object.freeze({}),
		transport: null,
		urls: Object.freeze([])
	});
}
