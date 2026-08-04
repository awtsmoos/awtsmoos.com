// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.js
 * @description Atomically replaces the bootstrap marker with a grounded canonical Chossid.
 * The Awtsmoos joins measured feet to living motion while every frame is born anew;
 * Awtsmoos.com keeps the old vessel visible until the truthful GLB stands fully in view.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import {
	CANONICAL_PLAYER_SCALE,
	createGroundedCanonicalPlayer,
	prepareCanonicalPlayerMeshes
} from './EretzPlayerRuntimeFactories.js';
import { normalizeMinimalModelMaterials } from './MinimalMeadowMaterialReadability.js';
import { hydrateReadablePlayerMaterials } from './MinimalMeadowPlayerMaterialHydrator.js';

export function hydrateMinimalMeadowPlayer(runtime, environment = globalThis, dependencies = {}) {
	if (runtime.canonicalPlayer?.status === 'ready') {
		return Promise.resolve(runtime.canonicalPlayer);
	}
	if (runtime.canonicalPlayerPromise) return runtime.canonicalPlayerPromise;
	runtime.canonicalPlayerPromise = loadCanonicalPlayer(runtime, environment, dependencies);
	return runtime.canonicalPlayerPromise;
}

async function loadCanonicalPlayer(runtime, environment, dependencies) {
	announce(environment, { phase: 'starting', progress: 0 });
	const fallbackModel = runtime.model;
	try {
		const loadGltf = dependencies.loadGltf || loadIsolatedGltf;
		const gltf = await loadGltf(
			PLAYER_MODEL_URL,
			'minimal-meadow-player-canonical',
			{ onProgress: detail => announce(environment, detail) }
		);
		if (runtime.destroyed) return null;
		const prepared = createGroundedCanonicalPlayer(gltf.scene, runtime.state);
		const normalized = normalizeMinimalModelMaterials(prepared.visiblePlayer);
		const readable = hydrateReadablePlayerMaterials(prepared.visiblePlayer, environment.document);
		const meshCount = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
		if (meshCount < 1) {
			throw new Error('Canonical Chossid GLB contained no renderable meshes.');
		}
		installCanonicalPlayer(runtime, fallbackModel, gltf, prepared);
		runtime.canonicalPlayer = Object.freeze({
			animations: gltf.animations?.length || 0,
			feet: prepared.feet,
			materials: { normalized, readable },
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
		announce(environment, {
			error: runtime.canonicalPlayer.error,
			phase: 'fallback',
			progress: 1
		});
		environment.console?.warn?.('[MitzvahWorld] canonical Chossid hydration failed.', error);
		return null;
	}
}

function installCanonicalPlayer(runtime, fallbackModel, gltf, prepared) {
	runtime.scene.add(prepared.model);
	runtime.model = prepared.model;
	runtime.visiblePlayer = prepared.visiblePlayer;
	runtime.canonicalPlayerScene = prepared.visiblePlayer;
	runtime.playerGltf = { ...gltf, scene: prepared.model };
	runtime.feet = prepared.feet;
	runtime.footOffset = 0;
	runtime.state.feet = prepared.feet;
	for (const vessel of [runtime.collisionMover, runtime.mover, runtime.jumpPhysics]) {
		if (vessel) vessel.footOffset = 0;
	}
	if (runtime.player) {
		runtime.player.names = (gltf.animations || []).map(clip => clip.name || '');
	}
	runtime.equipment?.bindModel?.(prepared.model);
	fallbackModel.traverse?.(object => {
		object.visible = false;
	});
	fallbackModel.parent?.remove?.(fallbackModel);
}

function fallbackReceipt(error) {
	return Object.freeze({
		error: error?.message || String(error),
		source: PLAYER_MODEL_URL,
		status: 'fallback-visible'
	});
}

function announce(environment, detail) {
	const EventClass = environment.CustomEvent;
	if (!EventClass || !environment.dispatchEvent) return;
	environment.dispatchEvent(new EventClass('awtsmoos:model-progress', { detail }));
}

export default hydrateMinimalMeadowPlayer;
