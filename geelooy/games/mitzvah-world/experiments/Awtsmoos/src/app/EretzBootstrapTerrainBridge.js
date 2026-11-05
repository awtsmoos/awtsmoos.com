// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzBootstrapTerrainBridge.js
 * @description Starts visible terrain texture hydration after playability and publishes truthful loading, ready, unavailable, or degraded evidence.
 * The Awtsmoos clothes the earth beneath the first living stride while distant systems may sleep;
 * Awtsmoos.com keeps one idempotent promise and reveals whether the textured garment truly crossed the bridge deep.
 */

/** Starts one idempotent bootstrap terrain hydration promise and publishes its live state. */
export function startEretzBootstrapTerrainBridge(foundation, diagnostics = {}) {
	if (diagnostics.bootstrapTerrainHydrationPromise) {
		return diagnostics.bootstrapTerrainHydrationPromise;
	}
	const start = foundation?.terrain?.startTextureHydration;
	if (typeof start !== 'function') {
		const receipt = Object.freeze({ status: 'unavailable' });
		diagnostics.bootstrapTerrainHydrationState = receipt;
		diagnostics.bootstrapTerrainHydrationPromise = Promise.resolve(receipt);
		return diagnostics.bootstrapTerrainHydrationPromise;
	}
	diagnostics.bootstrapTerrainHydrationState = Object.freeze({ status: 'loading' });
	const promise = Promise.resolve()
		.then(() => start())
		.then(result => {
			diagnostics.bootstrapTerrainHydrationState = readyState(result);
			return result;
		})
		.catch(error => {
			const receipt = degradedState(error);
			diagnostics.bootstrapTerrainHydrationState = receipt;
			return receipt;
		});
	diagnostics.bootstrapTerrainHydrationPromise = promise;
	return promise;
}

function readyState(result) {
	return Object.freeze({
		failed: Number(result?.failed || 0),
		loaded: Number(result?.loaded || 0),
		phase: result?.phase || result?.mode || 'ready',
		status: 'ready'
	});
}

function degradedState(error) {
	return Object.freeze({
		error: error?.message || String(error),
		status: 'degraded'
	});
}
