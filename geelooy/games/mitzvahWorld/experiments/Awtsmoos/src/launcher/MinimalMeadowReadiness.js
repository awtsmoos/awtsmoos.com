// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadiness.js
 * @description Waits for renderer and canonical Chossid, then verifies the complete living meadow.
 * The Awtsmoos gathers garment, river, lake, tree, flower, home, quest, and creature each instant;
 * Awtsmoos.com reveals play only after the rendered world and every requested contract agree.
 */

import { installMinimalMeadowAnimation } from '../app/MinimalMeadowAnimationState.js?v=20260724-meadow-13';
import { startMinimalMeadowLoop } from '../app/MinimalMeadowLoop.js?v=20260724-meadow-21';
import {
	publishMinimalMeadowWorldReceipt,
	verifyMinimalMeadowWorld
} from './MinimalMeadowWorldReceipt.js?v=20260724-meadow-21';

export async function awaitMinimalMeadowReadiness(diagnostics, loading, documentValue, environment = globalThis) {
	const runtime = diagnostics.runtime;
	loading.world({ message: 'Activating equipment, water, trees, flowers, homes, and shlichus…', progress: 0.82 });
	const rendererReady = runtime.renderer.hydrate
		? runtime.renderer.hydrate({ environment })
		: Promise.resolve(null);
	await Promise.all([rendererReady, Promise.resolve(diagnostics.canonicalPlayerPromise)]);
	installMinimalMeadowAnimation(runtime);
	restartLoop(runtime, diagnostics, environment);
	renderVerifiedFrame(runtime);
	const receipt = verifyMinimalMeadowWorld(runtime);
	publishMinimalMeadowWorldReceipt(documentValue, receipt);
	loading.world({ message: 'Garments, river, lake, forest, flowers, houses, and quest ready.', progress: 1 });
	return diagnostics;
}

function restartLoop(runtime, diagnostics, environment) {
	if (!runtime.movement) return;
	runtime.movement.stop?.();
	runtime.movement = startMinimalMeadowLoop(runtime, environment);
	diagnostics.movement = runtime.movement;
}

function renderVerifiedFrame(runtime) {
	runtime.player?.update?.(0);
	runtime.model?.updateWorldMatrix?.();
	runtime.sky?.update?.();
	runtime.water?.update?.(0.016);
	runtime.trees?.update?.(0.016);
	runtime.vegetation?.update?.(0.016);
	runtime.houses?.update?.(0.016);
	runtime.enemies?.update?.(0.016);
	runtime.cameraRig.update(runtime.camera, runtime.state, runtime.mainOctree, 1);
	runtime.renderer.setInteractor?.(runtime.state);
	runtime.renderer.render(runtime.scene, runtime.camera);
	if (!runtime.renderer.delegate) throw new Error('Rich meadow renderer did not become active.');
}

export default awaitMinimalMeadowReadiness;
