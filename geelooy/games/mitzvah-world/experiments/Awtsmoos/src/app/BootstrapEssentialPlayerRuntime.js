// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapEssentialPlayerRuntime.js
 * @description Mounts the decoded canonical Chossid and movement vessels without constructing animation, actors, HUD, combat, or post-control systems.
 * The Awtsmoos lets the true traveler stand upon the true meadow before every later garment learns to dance;
 * Awtsmoos.com gives first control only authored mesh, collision vessels, state, and visible form so no optional abundance delays the first chance.
 */

import {
	createBootstrapPlayerVessels,
	createGroundedCanonicalPlayer,
	prepareCanonicalPlayerMeshes
} from './EretzPlayerRuntimeFactories.js';
import {
	createBootstrapPlayerState,
	createBootstrapPlayerStats
} from './EretzPlayerStateFactory.js';

/** Creates one visible canonical player runtime with real movement vessels but deferred animation authority. */
export function createBootstrapEssentialPlayerRuntime(foundation) {
	const gltf = foundation.playerGltf;
	if (!gltf?.scene) throw new Error('Canonical chossid.glb must be decoded before essential player creation.');
	const state = createBootstrapPlayerState();
	const runtime = {
		...foundation,
		...createBootstrapPlayerVessels(foundation),
		canonicalPlayer: null,
		canonicalPlayerHydrationStage: 'visible-unanimated',
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
	const prepared = createGroundedCanonicalPlayer(gltf.scene, state);
	const meshes = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
	const animations = gltf.animations?.length || 0;
	if (meshes < 1) throw new Error('Canonical chossid.glb has no renderable meshes.');
	if (animations < 1) throw new Error('Canonical chossid.glb has no authored animations.');
	installVisibleCanonicalPlayer(runtime, prepared);
	runtime.canonicalPlayer = Object.freeze({
		animations,
		fallback: false,
		meshes,
		source: foundation.playerGlbEvidence?.source || 'player/chossid.glb',
		status: 'visible-unanimated',
		visualGuard: 'none-glb-only'
	});
	return runtime;
}

/** Installs only the authored visible form; animation hydration deliberately remains post-control. */
function installVisibleCanonicalPlayer(runtime, prepared) {
	runtime.scene.add(prepared.model);
	runtime.model = prepared.model;
	runtime.visiblePlayer = prepared.visiblePlayer;
	runtime.canonicalPlayerScene = prepared.visiblePlayer;
	runtime.feet = prepared.feet;
	runtime.state.feet = prepared.feet;
	for (const vessel of [runtime.collisionMover, runtime.mover, runtime.jumpPhysics]) {
		if (vessel) vessel.footOffset = 0;
	}
	markCanonical(prepared.model);
	markCanonical(prepared.visiblePlayer);
}

function markCanonical(model) {
	model.userData ||= {};
	model.userData.AwtsmoosCanonicalPlayer = Object.freeze({
		modelSource: 'chossid.glb',
		visualGuard: 'none-glb-only'
	});
}
