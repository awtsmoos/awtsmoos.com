// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.js
 * @description Atomically replaces fallback humanity with the asset-native animated canonical Chossid.
 * The Awtsmoos joins measured feet, authored colors, bones, and imported motion in one living vessel;
 * Awtsmoos.com never lets a procedural silhouette or a names-only animation stub survive production hydration.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import { installCanonicalChossidAnimation } from './MinimalMeadowCanonicalAnimation.js';
import {
	CANONICAL_PLAYER_SCALE,
	createGroundedCanonicalPlayer,
	prepareCanonicalPlayerMeshes
} from './EretzPlayerRuntimeFactories.js';
import { hydrateReadablePlayerMaterials } from './MinimalMeadowPlayerMaterialHydrator.js';

export function hydrateMinimalMeadowPlayer(runtime, environment = globalThis, dependencies = {}) {
	if (runtime.canonicalPlayer?.status === 'ready') return Promise.resolve(runtime.canonicalPlayer);
	if (runtime.canonicalPlayerPromise) return runtime.canonicalPlayerPromise;
	runtime.canonicalPlayerPromise = loadCanonicalPlayer(runtime, environment, dependencies);
	return runtime.canonicalPlayerPromise;
}

async function loadCanonicalPlayer(runtime, environment, dependencies) {
	announce(environment, { phase: 'starting', progress: 0 });
	const fallbackModel = runtime.model;
	try {
		const loadGltf = dependencies.loadGltf || loadIsolatedGltf;
		const gltf = await loadGltf(PLAYER_MODEL_URL, 'minimal-meadow-player-canonical', {
			onProgress: detail => announce(environment, detail)
		});
		if (runtime.destroyed) return null;
		const prepared = createGroundedCanonicalPlayer(gltf.scene, runtime.state);
		const materials = hydrateReadablePlayerMaterials(prepared.visiblePlayer);
		const meshCount = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
		if (meshCount < 1) throw new Error('Canonical Chossid GLB contained no renderable meshes.');
		const animation = installCanonicalPlayer(runtime, fallbackModel, gltf, prepared);
		const evidence = canonicalEvidence(animation, gltf);
		markCanonical(prepared.model, evidence);
		markCanonical(prepared.visiblePlayer, evidence);
		runtime.canonicalPlayer = Object.freeze({
			animations: gltf.animations?.length || 0,
			defaultClip: animation.defaultClip,
			feet: prepared.feet,
			materials,
			meshes: meshCount,
			scale: CANONICAL_PLAYER_SCALE,
			source: PLAYER_MODEL_URL,
			status: 'ready'
		});
		announce(environment, { phase: 'ready', progress: 1 });
		return runtime.canonicalPlayer;
	} catch (error) {
		fallbackModel.visible = true;
		runtime.model = fallbackModel;
		runtime.canonicalPlayer = fallbackReceipt(error);
		announce(environment, { error: runtime.canonicalPlayer.error, phase: 'fallback', progress: 1 });
		environment.console?.warn?.('[MitzvahWorld] canonical Chossid hydration failed.', error);
		return null;
	}
}

function installCanonicalPlayer(runtime, fallbackModel, gltf, prepared) {
	runtime.scene.add(prepared.model);
	runtime.model = prepared.model;
	runtime.visiblePlayer = prepared.visiblePlayer;
	runtime.canonicalPlayerScene = prepared.visiblePlayer;
	runtime.playerGltf = { ...gltf, scene: prepared.visiblePlayer };
	runtime.feet = prepared.feet;
	runtime.footOffset = 0;
	runtime.state.feet = prepared.feet;
	for (const vessel of [runtime.collisionMover, runtime.mover, runtime.jumpPhysics]) {
		if (vessel) vessel.footOffset = 0;
	}
	const animation = installCanonicalChossidAnimation(runtime, gltf, prepared.visiblePlayer);
	runtime.equipment?.bindModel?.(prepared.model);
	fallbackModel.traverse?.(object => { object.visible = false; });
	fallbackModel.parent?.remove?.(fallbackModel);
	return animation;
}

function canonicalEvidence(animation, gltf) {
	return Object.freeze({
		animationCount: gltf.animations?.length || 0,
		defaultClip: animation.defaultClip,
		modelSource: 'chossid.glb',
		measuredAnimatedIdle: Boolean(animation.defaultClip)
	});
}

function markCanonical(model, evidence) {
	model.userData ||= {};
	model.userData.AwtsmoosCanonicalPlayer = evidence;
}

function fallbackReceipt(error) {
	return Object.freeze({ error: error?.message || String(error), source: PLAYER_MODEL_URL, status: 'fallback-visible' });
}

function announce(environment, detail) {
	if (!environment.CustomEvent || !environment.dispatchEvent) return;
	environment.dispatchEvent(new environment.CustomEvent('awtsmoos:model-progress', { detail }));
}

export default hydrateMinimalMeadowPlayer;
