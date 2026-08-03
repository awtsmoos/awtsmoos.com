// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainHydration.js
 * @description Publishes terrain identity immediately and binds the first verified remote image progressively.
 * The Awtsmoos reveals real pixels before distant abundance completes its procession;
 * Awtsmoos.com keeps fallback play instant while every later garment enriches the same creation.
 */

import {
	createMinimalMeadowTerrainSourceSnapshot,
	loadMinimalMeadowTerrainSources
} from './MinimalMeadowTerrainSources.js?v=20260803-progressive-1';

const TERRAIN_SOURCES_URL = new URL(
	'./MinimalMeadowTerrainSources.js?v=20260803-progressive-1',
	import.meta.url
).href;
const FOLDED_TERRAIN_MODULE = Object.freeze({
	createMinimalMeadowTerrainSourceSnapshot,
	loadMinimalMeadowTerrainSources
});

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
	const sources = await module.loadMinimalMeadowTerrainSources({
		onTextureSettled(record) {
			applySettledRemoteImage(group, record);
		}
	});
	stats.textureSources = sourceEvidence(sources);
	applyFirstRemoteImage(group, sources.images);
	state.error = null;
	state.failed = sources.failed || 0;
	state.loaded = sources.loaded || 0;
	state.phase = sources.mode || (state.loaded ? 'partial' : 'degraded');
	return Object.freeze({ ...state });
}

function resolveTerrainModule(importer) {
	return importer ? importer(TERRAIN_SOURCES_URL) : FOLDED_TERRAIN_MODULE;
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

function applySettledRemoteImage(group, record) {
	if (!record?.ok || !record.image) return;
	const material = group.children?.[0]?.material;
	if (!material || usableImage(material.mapImage)) return;
	bindImage(material, record.image, record.url || record.primaryUrl || null);
}

function applyFirstRemoteImage(group, images = {}) {
	const image = Object.values(images).find(usableImage);
	const material = group.children?.[0]?.material;
	if (image && material) bindImage(material, image, image.src || null);
}

function bindImage(material, image, textureUrl) {
	material.map = image;
	material.mapImage = image;
	material.textureUrl = textureUrl;
	material.color = [1, 1, 1, 1];
	material.needsUpdate = true;
}

function usableImage(image) {
	return Boolean(image) && Number(image.naturalWidth || image.width || 0) > 0;
}

function deferredSourceEvidence() {
	return Object.freeze({
		mode: 'deferred',
		records: Object.freeze({}),
		transport: null,
		urls: Object.freeze([])
	});
}
