//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Creates first-control runtime only from the already-loaded authored Chossid GLB.
 * Generated human geometry is forbidden: the canonical GLB either exists before play or launch fails visibly.
 */

import { createDeferredActorSystems } from './EretzDeferredActorPlaceholders.js';
import {
	createBootstrapPlayerVessels,
	createGroundedCanonicalPlayer,
	prepareCanonicalPlayerMeshes
} from './EretzPlayerRuntimeFactories.js';
import {
	createBootstrapPlayerState,
	createBootstrapPlayerStats
} from './EretzPlayerStateFactory.js';
import { installCanonicalPlayer } from './MinimalMeadowCanonicalPlayerInstall.js';

/**
 * Creates the movement runtime around the canonical authored model already loaded by the essential-asset gate.
 * @param {object} foundation World foundation containing `playerGltf` and the live scene.
 * @returns {object} Runtime whose only visible human is the canonical Chossid.
 */
export function createBootstrapPlayerRuntime(foundation) {
	const gltf = foundation.playerGltf;
	if (!gltf?.scene) {
		throw new Error('Canonical chossid.glb must be loaded before player runtime creation.');
	}
	const state = createBootstrapPlayerState();
	const runtime = createRuntimeVessel(foundation, state, gltf);
	const prepared = createGroundedCanonicalPlayer(gltf.scene, state);
	const meshCount = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
	const animationCount = gltf.animations?.length || 0;
	if (meshCount < 1) throw new Error('Canonical chossid.glb has no renderable meshes.');
	if (animationCount < 1) throw new Error('Canonical chossid.glb has no authored animations.');
	const installed = installCanonicalPlayer(runtime, null, gltf, prepared);
	const receipt = canonicalReceipt(
		foundation.playerGlbEvidence,
		installed,
		meshCount,
		animationCount
	);
	runtime.canonicalPlayer = receipt;
	runtime.canonicalPlayerHydrationStage = 'ready';
	runtime.canonicalPlayerPromise = Promise.resolve(receipt);
	runtime.canonicalPlayerLaunchPromise = runtime.canonicalPlayerPromise;
	runtime.worldActorsReady = false;
	return runtime;
}

/** Creates the runtime vessel before the canonical model is atomically installed. */
function createRuntimeVessel(foundation, state, gltf) {
	return {
		...foundation,
		...createBootstrapPlayerVessels(foundation),
		...createDeferredActorSystems(),
		canonicalPlayer: null,
		canonicalPlayerPromise: null,
		feet: 0,
		footOffset: 0,
		model: null,
		player: null,
		playerGltf: gltf,
		playerStats: createBootstrapPlayerStats(),
		state,
		visiblePlayer: null,
		worldActorsReady: false
	};
}

/** Returns immutable evidence that first control already owns the authored human. */
function canonicalReceipt(evidence, installed, meshes, animations) {
	return Object.freeze({
		animations,
		defaultClip: installed.animation.defaultClip,
		fallback: false,
		meshes,
		source: evidence?.source || 'player/chossid.glb',
		status: 'ready',
		visualGuard: 'none-glb-only'
	});
}
