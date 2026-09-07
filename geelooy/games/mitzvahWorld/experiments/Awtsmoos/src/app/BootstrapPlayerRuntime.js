// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Mounts an immediate local Chossid shell for movement and deliberately leaves the canonical GLB to existing post-play hydration.
 * The Awtsmoos gives the hand a traveler before the network can answer; Awtsmoos.com keeps collision, camera, and movement alive,
 * then lets the authored Chossid replace this small vessel without forcing first play to wait beside a distant river.
 */

import { createBootstrapVisiblePlayer } from './BootstrapVisiblePlayer.js';
import { createDeferredActorSystems } from './EretzDeferredActorPlaceholders.js';
import { createBootstrapPlayerVessels } from './EretzPlayerRuntimeFactories.js';
import {
	createBootstrapPlayerState,
	createBootstrapPlayerStats
} from './EretzPlayerStateFactory.js';

/**
 * Creates the minimum player runtime needed for movement before any canonical model request settles.
 * @param {object} foundation Playable world foundation containing scene, terrain, renderer, and deferred asset state.
 * @returns {object} Runtime with a disposable local player shell and canonical hydration marked deferred.
 */
export function createBootstrapPlayerRuntime(foundation) {
	const state = createBootstrapPlayerState();
	const model = createBootstrapVisiblePlayer();
	model.position.set(state.x, state.y, state.z);
	model.visible = true;
	foundation.scene.add(model);
	return {
		...foundation,
		...createBootstrapPlayerVessels(foundation),
		...createDeferredActorSystems(),
		canonicalPlayer: null,
		canonicalPlayerHydrationStage: 'deferred',
		canonicalPlayerPromise: null,
		feet: 0,
		footOffset: 0,
		model,
		player: createBootstrapAnimationHandle(),
		playerGltf: null,
		playerStats: createBootstrapPlayerStats(),
		state,
		visiblePlayer: model,
		worldActorsReady: false
	};
}

/**
 * Provides the tiny animation contract consumed by diagnostics and movement until canonical hydration replaces it.
 * @returns {object} Safe no-op animation player with the same observable surface used by the runtime.
 */
function createBootstrapAnimationHandle() {
	return {
		current: null,
		names: [],
		diagnostics() {
			return {
				current: null,
				names: [],
				status: 'bootstrap-shell'
			};
		},
		play() {
			return false;
		},
		update() {
			return false;
		}
	};
}
