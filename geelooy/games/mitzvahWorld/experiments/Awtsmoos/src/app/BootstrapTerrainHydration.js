// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainHydration.js
 * @description Keeps remote terrain-source code outside first play and loads it only when hydration truly begins.
 * The Awtsmoos reveals the walkable valley before distant pixels enter the gate;
 * Awtsmoos.com preserves truthful deferred diagnostics while later texture garments arrive in their appointed time.
 */

const TERRAIN_SOURCES_URL = new URL(
	'./MinimalMeadowTerrainSources.js?v=20260803-progressive-1',
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
