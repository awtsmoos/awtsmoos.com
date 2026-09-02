// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainHydration.js
 * @description Gates first gameplay on one verified preferred grass image while full authored terrain enrichment continues once in the background.
 * The Awtsmoos clothes the visible earth with one truthful garment before the distant catalog completes its flight;
 * Awtsmoos.com keeps the first frame authored and swift, while every later terrain layer may still arrive in ordered light.
 */

import {
	createBootstrapEssentialTerrainReadiness
} from './BootstrapEssentialTerrainReadiness.js';
import {
	bindBootstrapTerrainRecord,
	bindBootstrapTerrainRole
} from './BootstrapTerrainRemoteBinding.js';

const TERRAIN_SOURCES_URL = new URL(
	'./MinimalMeadowTerrainSources.js?v=20260901-real-grass-01',
	import.meta.url
).href;

/** Creates one idempotent essential-ready promise and one background full-catalog hydration task. */
export function createBootstrapTerrainHydration(group, stats, importer = null) {
	let essentialPromise = null;
	const state = { error: null, failed: 0, loaded: 0, phase: 'deferred' };
	stats.textureSources = deferredSourceEvidence();
	const diagnostics = () => Object.freeze({ ...state });
	const start = () => {
		if (essentialPromise) return essentialPromise;
		const readiness = createBootstrapEssentialTerrainReadiness(receipt => {
			applyEssentialReceipt(state, receipt);
		});
		essentialPromise = readiness.promise;
		void hydrate(group, stats, state, importer, readiness).catch(error => {
			if (!readiness.fail(error)) {
				recordBackgroundFailure(state, error);
			}
		});
		return essentialPromise;
	};
	return Object.freeze({ diagnostics, start });
}

/** Launches the complete authored catalog while reporting preferred-grass settlement immediately. */
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
	const bound = bindBootstrapTerrainRole(group, sources, 'grassFour');
	readiness.finish(bound, sources, preferredUrl);
	applyFullReceipt(state, sources, bound);
	return Object.freeze({ ...state });
}

/** Applies the early first-frame receipt without pretending the complete catalog has finished. */
function applyEssentialReceipt(state, receipt) {
	state.error = receipt.error || null;
	state.failed = Number(receipt.failed || 0);
	state.loaded = Number(receipt.loaded || 0);
	state.phase = receipt.phase;
}

/** Publishes the final full-catalog diagnostics after all optional enrichment has settled. */
function applyFullReceipt(state, sources, bound) {
	state.error = bound ? null : 'Preferred remote grass did not bind to visible terrain.';
	state.failed = Number(sources.failed || 0);
	state.loaded = Number(sources.loaded || 0);
	state.phase = bound ? (sources.mode || 'ready') : 'degraded';
}

/** Records optional enrichment failure without erasing already-proven essential grass readiness. */
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
