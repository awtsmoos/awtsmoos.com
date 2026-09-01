// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.js
 * @description Loads canonical humanity early but installs it only when its renderer is capable of visible manifestation.
 * The Awtsmoos preserves the bootstrap Chossid until the richer form can truly be seen;
 * Awtsmoos.com joins authored colors, bones, and motion without creating an invisible interval between.
 */

import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import {
	CANONICAL_PLAYER_SCALE,
	createGroundedCanonicalPlayer,
	prepareCanonicalPlayerMeshes
} from './EretzPlayerRuntimeFactories.js';
import { installCanonicalPlayer } from './MinimalMeadowCanonicalPlayerInstall.js';
import { waitForCanonicalVisualRenderer } from './MinimalMeadowCanonicalVisualGate.js';
import { hydrateReadablePlayerMaterials } from './MinimalMeadowPlayerMaterialHydrator.js';
import {
	announcePlayerHydration,
	preserveVisiblePlayerFallback
} from './MinimalMeadowPlayerHydrationState.js';

export function hydrateMinimalMeadowPlayer(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.canonicalPlayer?.status === 'ready') {
		return Promise.resolve(runtime.canonicalPlayer);
	}
	if (runtime.canonicalPlayerPromise) return runtime.canonicalPlayerPromise;
	runtime.canonicalPlayerPromise = loadCanonicalPlayer(
		runtime,
		environment,
		dependencies
	);
	return runtime.canonicalPlayerPromise;
}

async function loadCanonicalPlayer(runtime, environment, dependencies) {
	announcePlayerHydration(environment, { phase: 'starting', progress: 0 });
	const fallbackModel = runtime.model;
	try {
		const loadGltf = dependencies.loadGltf || loadIsolatedGltf;
		const gltf = await loadGltf(PLAYER_MODEL_URL, 'minimal-meadow-player-canonical', {
			onProgress: detail => announcePlayerHydration(environment, detail)
		});
		if (runtime.destroyed) return null;
		const prepared = createGroundedCanonicalPlayer(gltf.scene, runtime.state);
		const materials = hydrateReadablePlayerMaterials(prepared.visiblePlayer);
		const meshCount = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
		if (meshCount < 1) {
			throw new Error('Canonical Chossid GLB contained no renderable meshes.');
		}
		const visualGate = dependencies.waitForVisualRenderer
			|| waitForCanonicalVisualRenderer;
		const rendererReady = await visualGate(
			runtime,
			environment,
			dependencies.visualGateOptions || {}
		);
		if (!rendererReady || runtime.destroyed) {
			return preserveVisiblePlayerFallback(runtime, fallbackModel, environment);
		}
		const installed = installCanonicalPlayer(runtime, fallbackModel, gltf, prepared);
		runtime.canonicalPlayer = canonicalReceipt(
			gltf,
			installed.animation,
			prepared,
			materials,
			meshCount
		);
		announcePlayerHydration(environment, { phase: 'ready', progress: 1 });
		return runtime.canonicalPlayer;
	} catch (error) {
		return preserveVisiblePlayerFallback(
			runtime,
			fallbackModel,
			environment,
			error
		);
	}
}

function canonicalReceipt(gltf, animation, prepared, materials, meshCount) {
	return Object.freeze({
		animations: gltf.animations?.length || 0,
		defaultClip: animation.defaultClip,
		feet: prepared.feet,
		materials,
		meshes: meshCount,
		scale: CANONICAL_PLAYER_SCALE,
		source: PLAYER_MODEL_URL,
		status: 'ready'
	});
}

export default hydrateMinimalMeadowPlayer;
