// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerHydration.js
 * @description Hydrates canonical humanity for alternate runtime paths and never restores a procedural person on failure.
 * The Awtsmoos lets authored bones arrive through measured WebGL readiness; Awtsmoos.com chooses honest absence over imitation,
 * then installs one grounded Chossid whose materials and animation may become the only visible human manifestation.
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
	rejectNoncanonicalPlayerFallback
} from './MinimalMeadowPlayerHydrationState.js';
import { resolveEretzPostPlayableWorldPolicy } from './EretzPostPlayableWorldPolicy.js';

export function hydrateMinimalMeadowPlayer(runtime, environment = globalThis, dependencies = {}) {
	if (runtime.canonicalPlayer?.status === 'ready') {
		return Promise.resolve(runtime.canonicalPlayer);
	}
	if (runtime.canonicalPlayerPromise) return runtime.canonicalPlayerPromise;
	runtime.canonicalPlayerPromise = loadCanonicalPlayer(runtime, environment, dependencies);
	return runtime.canonicalPlayerPromise;
}

async function loadCanonicalPlayer(runtime, environment, dependencies) {
	announcePlayerHydration(environment, { phase: 'starting', progress: 0 });
	const predecessor = runtime.model;
	try {
		const loadGltf = dependencies.loadGltf || loadIsolatedGltf;
		const gltf = await loadGltf(PLAYER_MODEL_URL, 'minimal-meadow-player-canonical', {
			onProgress: detail => announcePlayerHydration(environment, detail)
		});
		if (runtime.destroyed) return null;
		const prepared = createGroundedCanonicalPlayer(gltf.scene, runtime.state);
		const materials = hydrateReadablePlayerMaterials(prepared.visiblePlayer);
		const meshCount = prepareCanonicalPlayerMeshes(prepared.visiblePlayer);
		if (meshCount < 1) throw new Error('Canonical Chossid GLB contained no renderable meshes.');
		if ((gltf.animations?.length || 0) < 1) throw new Error('Canonical Chossid GLB contained no authored animations.');
		const visualGate = dependencies.waitForVisualRenderer || waitForCanonicalVisualRenderer;
		const rendererReady = await visualGate(
			runtime,
			environment,
			dependencies.visualGateOptions || {}
		);
		if (!rendererReady || runtime.destroyed) {
			return rejectNoncanonicalPlayerFallback(runtime, predecessor, environment);
		}
		const installed = installCanonicalPlayer(runtime, predecessor, gltf, prepared);
		runtime.canonicalPlayer = canonicalReceipt(gltf, installed.animation, prepared, materials, meshCount);
		// B"H: simple worlds never run the rich-feature chain, so the
		// post-playable priority that installs the meadow's friendly
		// neighbors may never fire — its activation waits on a visual
		// promise that can stall past the traveler's arrival. Install
		// them here too, beside spawn, without blocking the receipt; the
		// installer is idempotent, so a later post-playable run adds
		// nothing.
		startSimpleWorldFriendlyActorsBackstop(runtime, environment, dependencies);
		announcePlayerHydration(environment, { phase: 'ready', progress: 1 });
		return runtime.canonicalPlayer;
	} catch (error) {
		return rejectNoncanonicalPlayerFallback(runtime, predecessor, environment, error);
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
		status: 'ready',
		visualGuard: 'none-glb-only'
	});
}

/**
 * Installs the simple world's own friendly neighbors without blocking the
 * player receipt. Only simple worlds get the meadow's Chossidim — rich
 * worlds grow theirs through the post-playable chain. A failure settles
 * silently; the post-playable branch remains the primary installer.
 */
function startSimpleWorldFriendlyActorsBackstop(runtime, environment, dependencies) {
	try {
		const policy = resolveEretzPostPlayableWorldPolicy({ worldExperience: runtime.worldExperience });
		if (policy.canonicalPromotion) return;
	} catch {
		return;
	}
	const install = dependencies.installSimpleWorldFriendlyNpcs || installSimpleWorldFriendlyNpcs;
	Promise.resolve()
		.then(() => install(runtime, environment))
		.catch(() => null);
}

async function installSimpleWorldFriendlyNpcs(runtime, environment) {
	const module = await import('./MinimalMeadowFriendlyNpcs.js');
	return module.installMinimalMeadowFriendlyNpcs(runtime, environment);
}

export default hydrateMinimalMeadowPlayer;
