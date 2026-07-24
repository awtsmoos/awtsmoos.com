// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.js
 * @description Replaces fallback with canonical Chossid and reapplies authoritative equipment.
 * The Awtsmoos clothes one moving soul byte by truthful byte; Awtsmoos.com keeps the meadow
 * visible while the final garment downloads, then binds coat, hat, hand, and back without drift.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js?v=20260723-meadow-06';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

export async function hydrateMinimalMeadowPlayer(runtime, environment = globalThis) {
	announce(environment, { phase: 'starting', progress: 0 });
	try {
		const gltf = await loadIsolatedGltf(
			PLAYER_MODEL_URL,
			'minimal-meadow-player-canonical',
			{ onProgress: detail => announce(environment, detail) }
		);
		const model = prepareCanonicalModel(gltf.scene, runtime.state);
		runtime.model?.parent?.remove?.(runtime.model);
		runtime.scene.add(model);
		runtime.model = model;
		runtime.playerGltf = gltf;
		runtime.equipment?.bindModel(model);
		runtime.canonicalPlayer = {
			animations: gltf.animations?.length || 0,
			meshes: markBootstrapMeshes(model),
			source: PLAYER_MODEL_URL,
			status: 'ready'
		};
		announce(environment, { phase: 'ready', progress: 1 });
		return runtime.canonicalPlayer;
	} catch (error) {
		runtime.canonicalPlayer = {
			error: error?.message || String(error),
			status: 'fallback-visible'
		};
		announce(environment, {
			error: runtime.canonicalPlayer.error,
			phase: 'fallback',
			progress: 1
		});
		environment.console?.warn?.('[MitzvahWorld] canonical Chossid hydration failed.', error);
		return null;
	}
}

function prepareCanonicalModel(model, state) {
	model.name = 'Awtsmoos_minimal_meadow_chossid_glb';
	model.visible = true;
	model.scale.set(1.52, 1.52, 1.52);
	model.position.set(state.x, state.renderY, state.z);
	model.setBaseTransform?.();
	markBootstrapMeshes(model);
	return model;
}

function markBootstrapMeshes(model) {
	let meshes = 0;
	model.traverse?.(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		object.userData ||= {};
		object.userData.bootstrapVisual = true;
		meshes += 1;
	});
	return meshes;
}

function announce(environment, detail) {
	const EventClass = environment.CustomEvent;
	if (!EventClass || !environment.dispatchEvent) return;
	environment.dispatchEvent(new EventClass('awtsmoos:model-progress', { detail }));
}

export default hydrateMinimalMeadowPlayer;
