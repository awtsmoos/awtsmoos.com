// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Mounts immediate canonical Chossid play while preserving deferred rich-frame actor contracts from first play.
 * The Awtsmoos reveals one traveler before the crowd without making later absence dangerous; Awtsmoos.com binds
 * the real Chossid now and the canonical no-op actor vessels beside him until streamed actors replace them in their hour.
 */

import { createBootstrapVisiblePlayer } from './BootstrapVisiblePlayer.js';
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
import { hydrateMinimalMeadowPlayer } from './MinimalMeadowPlayerHydration.js';

const CANONICAL_PLAYER_SCALE = 1.52;

export function createBootstrapPlayerRuntime(foundation) {
	const model = foundation.playerGltf.scene;
	model.name ||= 'Awtsmoos_minimal_meadow_player';
	model.position.set(0, 0, 0);
	model.scale?.set?.(CANONICAL_PLAYER_SCALE, CANONICAL_PLAYER_SCALE, CANONICAL_PLAYER_SCALE);
	model.visible = true;
	model.setBaseTransform?.();
	let meshCount = prepareCanonicalPlayerMeshes(model);
	let visiblePlayer = model;
	if (meshCount === 0) {
		visiblePlayer = createBootstrapVisiblePlayer();
		model.add(visiblePlayer);
		meshCount = visiblePlayer.userData.meshCount;
	}
	if (!model.parent) foundation.scene.add(model);
	const state = createBootstrapPlayerState();
	const deferredActors = createDeferredActorSystems();
	let runtime = null;
	const player = bootstrapAnimationHandle(foundation.playerGltf.animations || [], state);
	runtime = {
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
	startCanonicalPlayer(runtime, foundation, visiblePlayer === model, meshCount);
	return runtime;
}

function startCanonicalPlayer(runtime, foundation, alreadyCanonical, meshCount) {
	if (!alreadyCanonical) {
		runtime.canonicalPlayerPromise = hydrateMinimalMeadowPlayer(
			runtime,
			foundation.environment || globalThis,
			foundation.playerHydrationDependencies || {}
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
	runtime.canonicalPlayerPromise = Promise.resolve(runtime.canonicalPlayer);
}

function bootstrapAnimationHandle(animations, state) {
	return {
		diagnostics: () => ({
			action: state.action,
			animations: animations.length,
			bootstrap: true,
			lifecycle: state.lifecycle
		}),
		names: animations.map(clip => clip.name || ''),
		play() {},
		update() {}
	};
}
