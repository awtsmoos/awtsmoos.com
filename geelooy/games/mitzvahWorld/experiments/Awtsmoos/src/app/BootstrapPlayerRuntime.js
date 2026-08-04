// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Mounts immediate Chossid play, lawful collision, and canonical replacement.
 * The Awtsmoos grants one identity through fallback, motion, defeat, and renewal;
 * Awtsmoos.com keeps the first frame playable while the measured garment reaches its reveal.
 */

import { createBootstrapVisiblePlayer } from './BootstrapVisiblePlayer.js';
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
	let runtime = null;
	const player = {
		diagnostics: () => ({
			action: state.action,
			animations: runtime.playerGltf.animations?.length || 0,
			bootstrap: true,
			jumpsUsed: state.jumpsUsed,
			lifecycle: state.lifecycle,
			meshes: runtime.canonicalPlayer?.meshes || meshCount,
			position: { x: state.x, y: state.y, z: state.z },
			realModel: runtime.canonicalPlayer?.status === 'ready'
		}),
		names: (foundation.playerGltf.animations || []).map(clip => clip.name || ''),
		update() {}
	};
	runtime = {
		...foundation,
		...createBootstrapPlayerVessels(foundation),
		feet: 0,
		footOffset: 0,
		model,
		player,
		playerStats: createBootstrapPlayerStats(),
		state,
		visiblePlayer
	};
	startCanonicalPlayer(runtime, foundation, visiblePlayer === model, meshCount);
	return runtime;
}

function startCanonicalPlayer(runtime, foundation, alreadyCanonical, meshCount) {
	if (alreadyCanonical) {
		runtime.canonicalPlayer = Object.freeze({
			animations: runtime.playerGltf.animations?.length || 0,
			meshes: meshCount,
			scale: CANONICAL_PLAYER_SCALE,
			status: 'ready'
		});
		runtime.canonicalPlayerPromise = Promise.resolve(runtime.canonicalPlayer);
		return;
	}
	runtime.canonicalPlayerPromise = hydrateMinimalMeadowPlayer(
		runtime,
		foundation.environment || globalThis,
		foundation.playerHydrationDependencies || {}
	);
}
