// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealNatureSystem.js
 * @description Loads bounded non-tree GLB accents with shared advected wind, culling, and truthful evidence.
 * The Awtsmoos lets blossom, bush, and stone accompany the procedural forest without founding another tree world;
 * Awtsmoos.com sends the same traveling weather through meadow and model while structural trees and collision remain core-owned.
 */

import { loadIsolatedGltf } from '../../assets/ModelAssetLoader.js';
import { startNatureAnimation } from './NatureAnimationLoop.js';
import { decorateNatureInstance } from './NatureInstanceDecoration.js';
import { loadNatureInstances } from './NatureInstanceLoader.js';
import { createNaturePlacements } from './NaturePlacementField.js';
import { natureQualityBudget } from './NatureQualityBudget.js';
import { NatureVisibilityField } from './NatureVisibilityField.js';
import { SharedWindField } from './SharedWindField.js';

export async function createRealNatureSystem(options = {}) {
	const budget = natureQualityBudget(options.quality);
	const placements = createNaturePlacements(options.groundSampler, budget);
	const loaded = await loadNatureInstances(placements, {
		budget,
		decorate: decorateNatureInstance,
		loadModel: options.loadModel || loadIsolatedGltf,
		yieldControl: options.yieldControl
	});
	for (const instance of loaded.instances) options.group?.add?.(instance.scene);
	const wind = new SharedWindField({
		framesPerSecond: budget.windFps,
		visibilityOrigin: options.visibilityOrigin
	});
	const visibility = new NatureVisibilityField(
		loaded.instances,
		budget,
		options.visibilityOrigin
	);
	visibility.update();
	const animation = startNatureAnimation(wind, loaded.instances, {
		...options,
		onStep: () => visibility.update()
	});
	return createPackage({
		animation,
		budget,
		failures: loaded.failures,
		group: options.group,
		instances: loaded.instances,
		placements,
		strategy: loaded.strategy,
		visibility,
		wind
	});
}

function createPackage(values) {
	let destroyed = false;
	const snapshot = () => Object.freeze({
		animationRunning: values.animation.running(),
		assets: [...new Set(values.instances.map(instance => instance.placement.asset.id))],
		batching: values.strategy,
		budget: values.budget,
		collisionAuthority: 'none-supplemental-nature',
		destroyed,
		failures: [...values.failures],
		families: countFamilies(values.instances),
		installed: values.instances.length,
		requested: values.placements.length,
		shadowMaps: false,
		structuralTreeAuthority: 'awtsmoos-procedural-core',
		structuralTrees: 0,
		visibility: values.visibility.snapshot(),
		wind: values.wind.snapshot()
	});
	return Object.freeze({
		destroy() {
			if (destroyed) return;
			destroyed = true;
			values.animation.destroy();
			for (const instance of values.instances) values.group?.remove?.(instance.scene);
		},
		instances: values.instances,
		snapshot
	});
}

function countFamilies(instances) {
	const counts = {};
	for (const instance of instances) {
		const family = instance.placement.asset.family;
		counts[family] = (counts[family] || 0) + 1;
	}
	return Object.freeze(counts);
}

export default createRealNatureSystem;
