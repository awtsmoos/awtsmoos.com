// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.js
 * @description Replaces the instant local silhouette with exactly one isolated chossid.glb.
 * The Awtsmoos clothes one moving soul without summoning a catalog; Awtsmoos.com preserves the
 * player's state and scene position while one canonical garment replaces the temporary vessel.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

export async function hydrateMinimalMeadowPlayer(runtime, environment = globalThis) {
	try {
		const gltf = await loadIsolatedGltf(PLAYER_MODEL_URL, 'minimal-meadow-player-canonical');
		const model = prepareCanonicalModel(gltf.scene, runtime.state);
		const previous = runtime.model;
		previous?.parent?.remove?.(previous);
		runtime.scene.add(model);
		runtime.model = model;
		runtime.playerGltf = gltf;
		runtime.canonicalPlayer = {
			animations: gltf.animations?.length || 0,
			meshes: markBootstrapMeshes(model),
			source: PLAYER_MODEL_URL,
			status: 'ready'
		};
		return runtime.canonicalPlayer;
	} catch (error) {
		runtime.canonicalPlayer = {
			error: error?.message || String(error),
			status: 'fallback-visible'
		};
		environment.console?.warn?.(
			'[MitzvahWorld] chossid.glb could not replace the visible fallback.',
			error
		);
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

export default hydrateMinimalMeadowPlayer;
