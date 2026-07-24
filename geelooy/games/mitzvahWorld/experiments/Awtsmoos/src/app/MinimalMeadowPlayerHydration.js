// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.js
 * @description Replaces the visible fallback only after one canonical Chossid GLB is fully ready.
 * The Awtsmoos clothes the moving soul without removing its first garment too soon;
 * Awtsmoos.com preserves play, reports measured bytes, and leaves the fallback on every failure.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';

const PLAYER_MODEL_URL = './assets/models/player/chossid.glb';

/**
 * Loads, validates, mounts, and binds the canonical player without blocking core play.
 * @param {object} runtime Active meadow runtime with visible fallback model.
 * @param {Window|object} environment Browser-like environment.
 * @returns {Promise<object|null>} Canonical model receipt or null when fallback remains.
 */
export async function hydrateMinimalMeadowPlayer(runtime, environment = globalThis) {
	announce(environment, { phase: 'starting', progress: 0 });
	const fallbackModel = runtime.model;
	try {
		const gltf = await loadIsolatedGltf(
			PLAYER_MODEL_URL,
			'minimal-meadow-player-canonical',
			{ onProgress: detail => announce(environment, detail) }
		);
		if (runtime.destroyed) {
			return null;
		}
		const model = prepareCanonicalModel(gltf.scene, runtime.state);
		const meshCount = markBootstrapMeshes(model);
		if (meshCount < 1) {
			throw new Error('Canonical Chossid GLB contained no renderable meshes.');
		}
		runtime.scene.add(model);
		runtime.model = model;
		runtime.playerGltf = gltf;
		runtime.equipment?.bindModel?.(model);
		fallbackModel?.parent?.remove?.(fallbackModel);
		runtime.canonicalPlayer = {
			animations: gltf.animations?.length || 0,
			meshes: meshCount,
			source: PLAYER_MODEL_URL,
			status: 'ready'
		};
		announce(environment, { phase: 'ready', progress: 1 });
		return runtime.canonicalPlayer;
	} catch (error) {
		runtime.model = fallbackModel;
		runtime.canonicalPlayer = {
			error: error?.message || String(error),
			source: PLAYER_MODEL_URL,
			status: 'fallback-visible'
		};
		announce(environment, {
			error: runtime.canonicalPlayer.error,
			phase: 'fallback',
			progress: 1
		});
		environment.console?.warn?.(
			'[MitzvahWorld] canonical Chossid hydration failed; fallback remains visible.',
			error
		);
		return null;
	}
}

function prepareCanonicalModel(model, state) {
	const renderY = state.renderY ?? state.y ?? 0;
	model.name = 'Awtsmoos_minimal_meadow_chossid_glb';
	model.visible = true;
	model.scale.set(1.52, 1.52, 1.52);
	model.position.set(state.x || 0, renderY, state.z || 0);
	model.setBaseTransform?.();
	return model;
}

function markBootstrapMeshes(model) {
	let meshes = 0;
	model.traverse?.(object => {
		if (!object.isMesh && !object.isSkinnedMesh) {
			return;
		}
		object.userData ||= {};
		object.userData.bootstrapVisual = true;
		meshes += 1;
	});
	return meshes;
}

function announce(environment, detail) {
	const EventClass = environment.CustomEvent;
	if (!EventClass || !environment.dispatchEvent) {
		return;
	}
	environment.dispatchEvent(
		new EventClass('awtsmoos:model-progress', { detail })
	);
}

export default hydrateMinimalMeadowPlayer;
