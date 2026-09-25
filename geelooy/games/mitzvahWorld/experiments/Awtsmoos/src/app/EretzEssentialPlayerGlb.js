// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialPlayerGlb.js
 * @description Loads, times, and validates the immutable authored Chossid before gameplay may reveal a human form.
 * The Awtsmoos gives the traveler one truthful garment whose bones and meshes descend from the authored source;
 * Awtsmoos.com names every importer chamber while refusing a procedural substitute, so speed may improve without identity remorse.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import {
	beginCanonicalChossidTiming,
	completeCanonicalChossidTiming,
	recordCanonicalChossidStage
} from './MitzvahWorldCanonicalChossidTiming.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	failMitzvahWorldEssentialMilestone,
	updateMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';

/** Loads the canonical player GLB with no fallback factory and validates visible animation-bearing identity. */
export async function loadEretzEssentialPlayerGlb(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const environment = options.environment || globalThis;
	const loadGltf = options.playerLoader || loadIsolatedGltf;
	let importerStage = 'gltf-fetch-decode';
	beginCanonicalChossidTiming(environment);
	updatePlayerMilestone(environment, importerStage);
	boot?.begin?.('essential-player-glb');
	boot?.progress?.('essential-player-glb', 0, 1, 'Loading the authored Chossid…', 'loading');
	try {
		const gltf = await loadGltf(PLAYER_MODEL_URL, 'eretz-essential-player-canonical', {
			onProgress: detail => {
				importerStage = reportProgress(environment, boot, detail, importerStage);
			}
		});
		importerStage = 'canonical-validation';
		recordCanonicalChossidStage(environment, { phase: importerStage });
		const evidence = validateCanonicalPlayerGltf(gltf);
		completeMitzvahWorldEssentialMilestone(
			environment,
			ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
			{
				importerStage,
				resourceUrl: PLAYER_MODEL_URL
			}
		);
		completeCanonicalChossidTiming(environment, 'complete');
		boot?.progress?.('essential-player-glb', 1, 1, 'Authored Chossid ready.', 'ready');
		return Object.freeze({ evidence, gltf });
	} catch (error) {
		completeCanonicalChossidTiming(environment, 'failed');
		failMitzvahWorldEssentialMilestone(
			environment,
			ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
			{
				failureCode: 'CANONICAL_CHOSSID_GLB_LOAD_FAILED',
				failureMessage: error?.message || String(error),
				importerStage,
				resourceStatus: resourceStatusFromError(error),
				resourceUrl: PLAYER_MODEL_URL
			}
		);
		throw error;
	}
}

/** Rejects every fallback identity and requires renderable meshes plus authored animation. */
export function validateCanonicalPlayerGltf(gltf) {
	if (!gltf?.scene) throw new Error('Canonical Chossid GLB did not provide a scene.');
	if (isFallbackIdentity(gltf)) {
		throw new Error('Canonical Chossid request resolved to a forbidden fallback model.');
	}
	let meshes = 0;
	gltf.scene.traverse?.(object => {
		if (object.isMesh || object.isSkinnedMesh) meshes += 1;
	});
	const animations = gltf.animations?.length || 0;
	if (meshes < 1) throw new Error('Canonical Chossid GLB contained no renderable meshes.');
	if (animations < 1) throw new Error('Canonical Chossid GLB contained no authored animations.');
	return Object.freeze({ animations, meshes, source: PLAYER_MODEL_URL });
}

/** Returns true when any known asset-service fallback mark contaminates the player identity. */
export function isFallbackIdentity(gltf) {
	return Boolean(
		gltf?.userData?.fallback
		|| gltf?.scene?.userData?.fallback
		|| gltf?.scene?.userData?.modelAssetFallback
		|| gltf?.scene?.userData?.isolatedModelLoad?.fallback
	);
}

function updatePlayerMilestone(environment, importerStage) {
	updateMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED, {
		importerStage,
		resourceUrl: PLAYER_MODEL_URL
	});
}

function resourceStatusFromError(error) {
	return error?.status ?? error?.response?.status ?? null;
}

function reportProgress(environment, boot, detail = {}, fallbackStage) {
	const event = recordCanonicalChossidStage(environment, detail);
	const loaded = Number(detail.loaded || detail.loadedBytes || 0);
	const total = Number(detail.total || detail.totalBytes || 0);
	if (total > 0) {
		boot?.progress?.('essential-player-glb', loaded, total, 'Loading the authored Chossid…', 'loading');
	}
	return event.phase || fallbackStage;
}
