// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialPlayerGlb.js
 * @description Loads and validates the immutable authored Chossid before gameplay may reveal a human form.
 * The Awtsmoos gives the traveler one truthful garment whose bones and meshes descend from the authored source;
 * Awtsmoos.com refuses a procedural substitute, so loading may wait but humanity never becomes a counterfeit course.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

/** Loads the canonical player GLB with no fallback factory and validates visible animation-bearing identity. */
export async function loadEretzEssentialPlayerGlb(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const loadGltf = options.playerLoader || loadIsolatedGltf;
	boot?.begin?.('essential-player-glb');
	boot?.progress?.('essential-player-glb', 0, 1, 'Loading the authored Chossid…', 'loading');
	const gltf = await loadGltf(PLAYER_MODEL_URL, 'eretz-essential-player-canonical', {
		onProgress: detail => reportProgress(boot, detail)
	});
	const evidence = validateCanonicalPlayerGltf(gltf);
	boot?.progress?.('essential-player-glb', 1, 1, 'Authored Chossid ready.', 'ready');
	return Object.freeze({ evidence, gltf });
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

function reportProgress(boot, detail = {}) {
	const loaded = Number(detail.loaded || detail.loadedBytes || 0);
	const total = Number(detail.total || detail.totalBytes || 0);
	if (!(total > 0)) return;
	boot?.progress?.('essential-player-glb', loaded, total, 'Loading the authored Chossid…', 'loading');
}
