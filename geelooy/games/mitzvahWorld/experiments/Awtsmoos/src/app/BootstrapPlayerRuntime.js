// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Installs only the canonical grounded GLB as the playable Chossid and starts its authored animation immediately.
 * The Awtsmoos joins bones, cloth, soles, collision, and motion within one honest traveler;
 * Awtsmoos.com forbids a generated underlay, so every visible human pixel belongs to the authored GLB revelator.
 */

import { isFallbackPlayer } from './BootstrapPlayerPresentation.js';
import { createDeferredActorSystems } from './EretzDeferredActorPlaceholders.js';
import { installCanonicalChossidAnimation } from './MinimalMeadowCanonicalAnimation.js';
import { hydrateReadablePlayerMaterials } from './MinimalMeadowPlayerMaterialHydrator.js';
import {
	CANONICAL_PLAYER_SCALE,
	createBootstrapPlayerVessels,
	createGroundedCanonicalPlayer,
	prepareCanonicalPlayerMeshes
} from './EretzPlayerRuntimeFactories.js';
import {
	createBootstrapPlayerState,
	createBootstrapPlayerStats
} from './EretzPlayerStateFactory.js';

export function createBootstrapPlayerRuntime(foundation) {
	assertCanonicalGltf(foundation.playerGltf);
	const state = createBootstrapPlayerState();
	const prepared = createGroundedCanonicalPlayer(foundation.playerGltf.scene, state);
	const meshCount = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
	if (meshCount < 1) throw new Error('Canonical Chossid GLB contained no renderable meshes.');
	if (!prepared.model.parent) foundation.scene.add(prepared.model);
	const runtime = {
		...foundation,
		...createBootstrapPlayerVessels(foundation),
		...createDeferredActorSystems(),
		feet: prepared.feet,
		footOffset: 0,
		model: prepared.model,
		player: null,
		playerStats: createBootstrapPlayerStats(),
		state,
		visiblePlayer: prepared.visiblePlayer,
		worldActorsReady: false
	};
	const materials = hydrateReadablePlayerMaterials(prepared.visiblePlayer);
	const animation = installCanonicalChossidAnimation(
		runtime,
		foundation.playerGltf,
		prepared.visiblePlayer
	);
	if (!animation.defaultClip) {
		throw new Error('Canonical Chossid GLB did not expose a playable animation clip.');
	}
	runtime.canonicalPlayer = canonicalReceipt(foundation, animation, materials, meshCount);
	runtime.canonicalPlayerHydrationStage = 'ready';
	runtime.canonicalPlayerPromise = Promise.resolve(runtime.canonicalPlayer);
	return runtime;
}

function assertCanonicalGltf(gltf) {
	if (!gltf?.scene) throw new Error('Canonical Chossid GLB scene is required before player runtime.');
	if (isFallbackPlayer(gltf)) throw new Error('Generated player fallbacks are forbidden.');
	if ((gltf.animations?.length || 0) < 1) {
		throw new Error('Canonical Chossid GLB animations are required before player runtime.');
	}
}

function canonicalReceipt(foundation, animation, materials, meshCount) {
	return Object.freeze({
		animations: foundation.playerGltf.animations.length,
		defaultClip: animation.defaultClip,
		materials,
		meshes: meshCount,
		scale: CANONICAL_PLAYER_SCALE,
		status: 'ready',
		visualGuard: 'none-glb-only'
	});
}
