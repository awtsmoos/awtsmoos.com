// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Mounts immediate Chossid play and promotes the real grounded GLB just beyond first control.
 * The Awtsmoos lets a humble local form answer the hand before the authored garment is revealed;
 * Awtsmoos.com keeps state, collision, camera height, and movement alive while canonical humanity is sealed.
 */

import { createBootstrapVisiblePlayer } from './BootstrapVisiblePlayer.js';
import { scheduleBootstrapCanonicalPlayerHydration } from './BootstrapCanonicalPlayerHydration.js';
import {
	createBootstrapAnimationHandle,
	isFallbackPlayer,
	prepareBootstrapPlayerMeshes
} from './BootstrapPlayerPresentation.js';
import { createDeferredActorSystems } from './EretzDeferredActorPlaceholders.js';
import { installCanonicalChossidAnimation } from './MinimalMeadowCanonicalAnimation.js';
import { hydrateReadablePlayerMaterials } from './MinimalMeadowPlayerMaterialHydrator.js';
import {
	createBootstrapPlayerVessels,
	prepareCanonicalPlayerMeshes
} from './EretzPlayerRuntimeFactories.js';
import {
	createBootstrapPlayerState,
	createBootstrapPlayerStats
} from './EretzPlayerStateFactory.js';

const CANONICAL_PLAYER_SCALE = 1.52;

export function createBootstrapPlayerRuntime(foundation) {
	const model = foundation.playerGltf.scene;
	const fallback = isFallbackPlayer(foundation.playerGltf);
	model.name ||= 'Awtsmoos_minimal_meadow_player';
	model.position.set(0, 0, 0);
	model.scale?.set?.(
		CANONICAL_PLAYER_SCALE,
		CANONICAL_PLAYER_SCALE,
		CANONICAL_PLAYER_SCALE
	);
	model.visible = true;
	model.setBaseTransform?.();
	let meshCount = fallback
		? prepareBootstrapPlayerMeshes(model)
		: prepareCanonicalPlayerMeshes(model);
	let visiblePlayer = model;
	if (meshCount === 0) {
		visiblePlayer = createBootstrapVisiblePlayer();
		model.add(visiblePlayer);
		meshCount = visiblePlayer.userData.meshCount;
	}
	if (!model.parent) foundation.scene.add(model);
	const state = createBootstrapPlayerState();
	const deferredActors = createDeferredActorSystems();
	const player = createBootstrapAnimationHandle(
		foundation.playerGltf.animations || [],
		state
	);
	const runtime = {
		...foundation,
		...createBootstrapPlayerVessels(foundation),
		...deferredActors,
		feet: 0,
		footOffset: 0,
		model,
		player,
		playerStats: createBootstrapPlayerStats(),
		state,
		visiblePlayer,
		worldActorsReady: false
	};
	startCanonicalPlayer(
		runtime,
		foundation,
		!fallback && visiblePlayer === model,
		meshCount
	);
	return runtime;
}

function startCanonicalPlayer(runtime, foundation, alreadyCanonical, meshCount) {
	if (!alreadyCanonical) {
		scheduleBootstrapCanonicalPlayerHydration(
			runtime,
			foundation,
			foundation.environment || globalThis
		);
		return;
	}
	const materials = hydrateReadablePlayerMaterials(runtime.visiblePlayer);
	const animation = installCanonicalChossidAnimation(
		runtime,
		runtime.playerGltf,
		runtime.visiblePlayer
	);
	runtime.canonicalPlayer = Object.freeze({
		animations: runtime.playerGltf.animations?.length || 0,
		defaultClip: animation.defaultClip,
		materials,
		meshes: meshCount,
		scale: CANONICAL_PLAYER_SCALE,
		status: 'ready'
	});
	runtime.canonicalPlayerHydrationStage = 'ready';
	runtime.canonicalPlayerPromise = Promise.resolve(runtime.canonicalPlayer);
}
