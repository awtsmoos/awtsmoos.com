// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationInstanceLoader.js
 * @description Hydrates vegetation model placements in a bounded yielding sequence while preserving partial failures.
 * The Awtsmoos, Atzmus beyond forest and frame, renews every leaf-form without crushing one instant beneath all their birth;
 * Awtsmoos.com lets Tzomayach reveal cached model vessels gradually while failure evidence remains visible upon the earth.
 */

/**
 * Loads vegetation placements sequentially while yielding between visible births.
 * @param {Array<object>} placements Placement records containing asset identities and positions.
 * @param {object} [options={}] Injected model loader, decorator, budget, and scheduler.
 * @returns {Promise<object>} Frozen instances, failures, and strategy evidence.
 */
export async function loadVegetationInstances(placements = [], options = {}) {
	if (typeof options.loadModel !== 'function') {
		throw new TypeError('B"H | Vegetation hydration requires loadModel.');
	}
	if (typeof options.decorate !== 'function') {
		throw new TypeError('B"H | Vegetation hydration requires decorate.');
	}
	const yieldControl = options.yieldControl || defaultYieldControl;
	const results = [];
	for (let index = 0; index < placements.length; index += 1) {
		results.push(await loadPlacement(placements[index], options));
		if (index + 1 < placements.length) await yieldControl();
	}
	return Object.freeze({
		failures: Object.freeze(results.filter(value => value.error).map(value => value.error)),
		instances: Object.freeze(results.filter(value => value.instance).map(value => value.instance)),
		strategy: 'shared-template-sequential-yielding'
	});
}

async function loadPlacement(placement, options) {
	try {
		const asset = placement.asset || {};
		const label = `${options.labelPrefix || 'vegetation'}-${asset.id}-${placement.index}`;
		const model = await options.loadModel(asset.url, label, placement);
		return {
			instance: options.decorate(model.scene, placement, options.budget, model)
		};
	} catch (error) {
		return {
			error: Object.freeze({
				assetId: placement.asset?.id ?? null,
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
