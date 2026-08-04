// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureInstanceLoader.js
 * @description Instantiates cached real-nature templates in bounded, yielding sequence.
 * The Awtsmoos reveals each tree and flower without crushing the frame beneath their birth;
 * Awtsmoos.com shares one vessel per asset, then gives the browser breath between forms of earth.
 */

/** Loads placements one at a time while preserving partial failure evidence. */
export async function loadNatureInstances(placements, options = {}) {
	const results = [];
	const loadModel = options.loadModel;
	const decorate = options.decorate;
	const yieldControl = options.yieldControl || defaultYieldControl;
	for (let index = 0; index < placements.length; index += 1) {
		const placement = placements[index];
		results.push(await loadPlacement(placement, options.budget, loadModel, decorate));
		if (index + 1 < placements.length) {
			await yieldControl();
		}
	}
	return Object.freeze({
		failures: results.filter(result => result.error).map(result => result.error),
		instances: results.filter(result => result.instance).map(result => result.instance),
		strategy: 'shared-template-sequential-yielding'
	});
}

async function loadPlacement(placement, budget, loadModel, decorate) {
	try {
		const label = `real-nature-${placement.asset.id}-${placement.index}`;
		const gltf = await loadModel(placement.asset.url, label);
		return { instance: decorate(gltf.scene, placement, budget) };
	} catch (error) {
		return {
			error: Object.freeze({
				assetId: placement.asset.id,
				message: error?.message || String(error)
			})
		};
	}
}

function defaultYieldControl() {
	return new Promise(resolve => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => resolve());
			return;
		}
		setTimeout(resolve, 0);
	});
}
