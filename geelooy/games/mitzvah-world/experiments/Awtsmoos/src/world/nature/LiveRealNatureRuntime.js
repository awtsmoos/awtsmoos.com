// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureRuntime.js
 * @description Adapts the final diagnostics runtime into a mobile-safe real-nature context.
 * The Awtsmoos leaves the broad world rich while five real vessels crown its living frame;
 * Awtsmoos.com keeps pine, tree, flower, bush, and rock without letting clone cost consume the game.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createLiveTerrainSampler } from './LiveTerrainSampler.js';

export function currentLiveRuntime(environment = globalThis) {
	return environment?.AwtsmoosDiagnostics?.runtime
		|| environment?.AwtsmoosMitzvahWorld?.runtime
		|| null;
}

/** Requires the fields directly observed on the final running meadow runtime. */
export function liveRuntimeReady(runtime) {
	return Boolean(
		runtime?.scene?.add
		&& runtime?.scene?.traverse
		&& runtime?.terrain?.heightAt
		&& runtime?.renderer
		&& runtime?.state
		&& runtime?.frameScheduler
	);
}

export function createLiveNatureContext(runtime) {
	const group = new Group();
	group.name = 'AwtsmoosRealNatureLiveBridge';
	runtime.scene.add(group);
	return Object.freeze({
		groundSampler: createLiveTerrainSampler(runtime.terrain),
		group,
		quality: 'low',
		sourceQuality: runtime.qualityProfile?.quality || 'medium',
		visibilityOrigin: () => liveVisibilityOrigin(runtime)
	});
}

export function attachLiveNatureRuntime(runtime, controller) {
	runtime.realNature = controller;
	if (!runtime.nature) runtime.nature = controller;
}

export function detachLiveNatureRuntime(runtime, controller, group) {
	if (runtime?.realNature === controller) delete runtime.realNature;
	if (runtime?.nature === controller) delete runtime.nature;
	group?.parent?.remove?.(group);
}

function liveVisibilityOrigin(runtime) {
	if (finitePoint(runtime?.state)) return runtime.state;
	if (finitePoint(runtime?.camera?.position)) return runtime.camera.position;
	if (finitePoint(runtime?.model?.position)) return runtime.model.position;
	return Object.freeze({ x: 0, y: 0, z: 0 });
}

function finitePoint(value) {
	return Number.isFinite(Number(value?.x))
		&& Number.isFinite(Number(value?.z));
}
