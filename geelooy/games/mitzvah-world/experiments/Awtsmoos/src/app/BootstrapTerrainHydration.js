// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainHydration.js
 * @description Hydrates visible terrain after play with preferred grass first, then canonical decoded grass fallbacks from the same remote catalog.
 * The Awtsmoos lets one authored grass be preferred without turning a network timeout into barren earth; Awtsmoos.com binds the first genuine decoded grass
 * already carried by the catalog, while optional terrain roles continue settling without blocking movement or inventing local texture imagery.
 */

import {
	createBootstrapEssentialTerrainReadiness
} from './BootstrapEssentialTerrainReadiness.js';
import {
	bindFirstBootstrapGrassRole
} from './BootstrapTerrainGrassSelection.js';
import {
	bindBootstrapTerrainRecord
} from './BootstrapTerrainRemoteBinding.js';

const TERRAIN_SOURCES_URL = new URL(
	'./MinimalMeadowTerrainSources.js?v=20260907-canonical-grass-fallback-01',
	import.meta.url
).href;

/** Creates one idempotent remote terrain hydration task. */
export function createBootstrapTerrainHydration(group, stats, importer = null) {
	let essentialPromise = null;
	const state = { activeUrl: null, error: null, failed: 0, loaded: 0, phase: 'deferred' };
	stats.textureSources = deferredSourceEvidence();
	const diagnostics = () => Object.freeze({ ...state });
	const start = () => {
		if (essentialPromise) return essentialPromise;
		const readiness = createBootstrapEssentialTerrainReadiness(receipt => {
			applyEssentialReceipt(state, receipt);
		});
		essentialPromise = readiness.promise;
		void hydrate(group, stats, state, importer, readiness).catch(error => {
			if (!readiness.fail(error)) recordBackgroundFailure(state, error);
		});
		return essentialPromise;
	};
	return Object.freeze({ diagnostics, start });
}

async function hydrate(group, stats, state, importer, readiness) {
	state.phase = 'loading';
	const module = await resolveTerrainModule(importer);
	publishImmediateCatalog(stats, module);
	const preferredUrl = module.TEXTURES?.grassFour || '';
	const sources = await module.loadMinimalMeadowTerrainSources({
		onTextureSettled(record) {
			const bound = bindBootstrapTerrainRecord(group, record, preferredUrl);
			readiness.observe(record, bound, preferredUrl);
		}
	});
	stats.textureSources = sourceEvidence(sources);
	const selection = bindFirstBootstrapGrassRole(group, sources);
	readiness.finish(selection.bound, sources, preferredUrl, selection.url);
	applyFullReceipt(state, sources, selection);
	return Object.freeze({ ...state });
}

function applyEssentialReceipt(state, receipt) {
	state.activeUrl = receipt.activeUrl || null;
	state.error = receipt.error || null;
	state.failed = Number(receipt.failed || 0);
	state.loaded = Number(receipt.loaded || 0);
	state.phase = receipt.phase;
}

function applyFullReceipt(state, sources, selection) {
	state.activeUrl = selection.url || state.activeUrl;
	state.error = selection.bound ? null : 'No canonical remote grass bound to visible terrain.';
	state.failed = Number(sources.failed || 0);
	state.loaded = Number(sources.loaded || 0);
	state.phase = selection.bound ? (sources.mode || 'ready') : 'degraded';
}

function recordBackgroundFailure(state, error) {
	state.error = error?.message || String(error);
	state.phase = state.loaded > 0 ? 'partial' : 'degraded';
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
