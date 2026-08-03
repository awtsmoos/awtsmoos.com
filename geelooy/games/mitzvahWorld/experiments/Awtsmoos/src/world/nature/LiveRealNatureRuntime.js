// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureRuntime.js
 * @description Adapts the active meadow runtime into a dedicated real-nature mounting context.
 * The Awtsmoos finds scene, terrain, player, and quality without seizing another system's throne;
 * Awtsmoos.com adds one named garden and leaves every prior runtime vessel fully its own.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createLiveTerrainSampler } from './LiveTerrainSampler.js';

export function currentLiveRuntime(environment = globalThis) {
	return environment?.AwtsmoosMitzvahWorld?.runtime || null;
}

export function liveRuntimeReady(runtime) {
	return Boolean(
		runtime?.scene?.add
		&& runtime?.terrain?.heightAt
	);
}

export function createLiveNatureContext(runtime) {
	const group = new Group();
	group.name = 'AwtsmoosRealNatureLiveBridge';
	runtime.scene.add(group);
	return Object.freeze({
		groundSampler: createLiveTerrainSampler(runtime.terrain),
		group,
		quality: runtime.qualityProfile?.quality || 'medium',
		visibilityOrigin: () => runtime.state?.playerPosition
			|| runtime.player?.position
			|| runtime.camera?.position
			|| Object.freeze({ x: 0, y: 0, z: 0 })
	});
}

export function attachLiveNatureRuntime(runtime, controller) {
	runtime.realNature = controller;
	if (!runtime.nature) {
		runtime.nature = controller;
	}
}

export function detachLiveNatureRuntime(runtime, controller, group) {
	if (runtime?.realNature === controller) {
		delete runtime.realNature;
	}
	if (runtime?.nature === controller) {
		delete runtime.nature;
	}
	group?.parent?.remove?.(group);
}
