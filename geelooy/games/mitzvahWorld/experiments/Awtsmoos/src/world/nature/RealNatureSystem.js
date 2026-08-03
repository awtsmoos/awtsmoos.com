// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealNatureSystem.js
 * @description Loads bounded isolated GLB scenes with shared wind, culling, and durable evidence.
 * The Awtsmoos reveals many living forms from five trusted vessels without blocking the way;
 * Awtsmoos.com keeps failures local, visibility measured, and every manifested scene removable today.
 */

import { loadIsolatedGltf } from '../../assets/ModelAssetLoader.js';
import { startNatureAnimation } from './NatureAnimationLoop.js';
import { decorateNatureInstance } from './NatureInstanceDecoration.js';
import { createNaturePlacements } from './NaturePlacementField.js';
import { natureQualityBudget } from './NatureQualityBudget.js';
import { NatureVisibilityField } from './NatureVisibilityField.js';
import { SharedWindField } from './SharedWindField.js';

/** Creates the real-nature package while preserving partial success per asset. */
export async function createRealNatureSystem(options = {}) {
	const budget = natureQualityBudget(options.quality);
	const placements = createNaturePlacements(options.groundSampler, budget);
	const loadModel = options.loadModel || loadIsolatedGltf;
	const results = await Promise.all(placements.map(placement => loadPlacement(
		placement,
		budget,
		loadModel
	)));
	const instances = results.filter(result => result.instance).map(result => result.instance);
	const failures = results.filter(result => result.error).map(result => result.error);
	for (const instance of instances) {
		options.group?.add?.(instance.scene);
	}
	const wind = new SharedWindField({ framesPerSecond: budget.windFps });
	const visibility = new NatureVisibilityField(instances, budget, options.visibilityOrigin);
	visibility.update();
	const animation = startNatureAnimation(wind, instances, {
		...options,
		onStep: () => visibility.update()
	});
	return createPackage(
		options.group,
		budget,
		placements,
		instances,
		failures,
		wind,
		visibility,
		animation
	);
}

async function loadPlacement(placement, budget, loadModel) {
	try {
		const label = `real-nature-${placement.asset.id}-${placement.index}`;
		const gltf = await loadModel(placement.asset.url, label);
		return { instance: decorateNatureInstance(gltf.scene, placement, budget) };
	} catch (error) {
		return {
			error: Object.freeze({
				assetId: placement.asset.id,
				message: error?.message || String(error)
			})
		};
	}
}

function createPackage(group, budget, placements, instances, failures, wind, visibility, animation) {
	let destroyed = false;
	const snapshot = () => Object.freeze({
		animationRunning: animation.running(),
		assets: [...new Set(instances.map(instance => instance.placement.asset.id))],
		batching: 'shared-url-cache-isolated-scenes',
		budget,
		collision: 'procedural-forest-ledger',
		destroyed,
		failures: [...failures],
		families: countFamilies(instances),
		installed: instances.length,
		requested: placements.length,
		shadowMaps: false,
		visibility: visibility.snapshot(),
		wind: wind.snapshot()
	});
	return Object.freeze({
		destroy() {
			if (destroyed) return;
			destroyed = true;
			animation.destroy();
			for (const instance of instances) {
				group?.remove?.(instance.scene);
			}
		},
		instances,
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
