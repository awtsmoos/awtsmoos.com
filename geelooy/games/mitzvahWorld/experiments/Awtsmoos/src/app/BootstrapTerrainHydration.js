// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainHydration.js
 * @description Publishes folded canonical terrain identity before optional remote pixels settle.
 * The Awtsmoos reveals the road and every garment's name without scattering source scrolls;
 * Awtsmoos.com preserves deferred decoding, injectable tests, transport truth, and exact evidence.
 */

import {
	createMinimalMeadowTerrainSourceSnapshot,
	loadMinimalMeadowTerrainSources
} from './MinimalMeadowTerrainSources.js?v=20260729-drive-1';

const TERRAIN_SOURCES_URL = new URL(
	'./MinimalMeadowTerrainSources.js?v=20260729-drive-1',
	import.meta.url
).href;
const FOLDED_TERRAIN_MODULE = Object.freeze({
	createMinimalMeadowTerrainSourceSnapshot,
	loadMinimalMeadowTerrainSources
});

export function createBootstrapTerrainHydration(
	group,
	stats,
	importer = null
) {
	let promise = null;
	const state = {
		error: null,
		failed: 0,
		loaded: 0,
		phase: 'deferred'
	};
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
	const sources = await module.loadMinimalMeadowTerrainSources();
	stats.textureSources = sourceEvidence(sources);
	applyFirstRemoteImage(group, sources.images);
	state.error = null;
	state.failed = sources.failed || 0;
	state.loaded = sources.loaded || 0;
	state.phase = sources.mode || (state.loaded ? 'partial' : 'degraded');
	return diagnosticsSnapshot(state);
}

function resolveTerrainModule(importer) {
	return importer ? importer(TERRAIN_SOURCES_URL) : FOLDED_TERRAIN_MODULE;
}

function publishImmediateCatalog(stats, module) {
	const snapshot = module.createMinimalMeadowTerrainSourceSnapshot?.();
	if (!snapshot) return;
	stats.textureSources = sourceEvidence(snapshot);
}

function sourceEvidence(sources) {
	return Object.freeze({
		mode: sources.mode,
		records: sources.records,
		transport: sources.transport,
		urls: sources.urls
	});
}

function applyFirstRemoteImage(group, images = {}) {
	const image = Object.values(images).find(Boolean);
	const material = group.children?.[0]?.material;
	if (!image || !material) return;
	material.mapImage = image;
	material.color = [1, 1, 1, 1];
	material.needsUpdate = true;
}

function deferredSourceEvidence() {
	return Object.freeze({
		mode: 'deferred',
		records: Object.freeze({}),
		transport: null,
		urls: Object.freeze([])
	});
}

function diagnosticsSnapshot(state) {
	return Object.freeze({ ...state });
}
