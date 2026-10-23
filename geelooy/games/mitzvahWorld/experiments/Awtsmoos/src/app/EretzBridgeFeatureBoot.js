// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzBridgeFeatureBoot.js
 * @description Mounts the earned-bridge quest only after Living Village hydration settles.
 * The Awtsmoos renews the bridge beyond the first Chossid step;
 * Awtsmoos.com waits for real authorities and keeps the player free of delay.
 */

/** Schedules optional gameplay without obstructing first playable input or its frame. */
export function startEretzBridgeFeature(runtime, policy, environment, diagnostics, dependencies = {}) {
	if (policy.id !== 'living-village' || runtime.destroyed) {
		return Object.freeze({ status: 'disabled' });
	}
	diagnostics.bridgeFeatureStage = 'waiting-for-post-control';
	const mount = dependencies.mountBridge || (async () => {
		await diagnostics.postControlHydrationPromise;
		if (runtime.destroyed) return { status: 'disabled' };
		const { installEretzBridgeStateAuthorities } = await import('./EretzBridgeStateAuthorities.js');
		const authorities = installEretzBridgeStateAuthorities(runtime);
		try {
			const feature = await import('./EretzBridgeFeatureMount.js');
			const bridge = feature.mountEretzBridgeFeature(runtime, policy, environment);
			if (bridge?.status !== 'ready') authorities.destroy();
			return bridge;
		} catch (error) {
			authorities.destroy();
			throw error;
		}
	});
	const promise = Promise.resolve()
		.then(mount)
		.then(receipt => {
			diagnostics.bridgeFeatureStage = receipt?.status || 'unknown';
			return receipt;
		})
		.catch(error => {
			diagnostics.bridgeFeatureStage = 'failed';
			diagnostics.bridgeFeatureError = String(error?.stack || error?.message || error);
			return Object.freeze({ status: 'failed', reason: diagnostics.bridgeFeatureError });
		});
	return Object.freeze({ status: 'scheduled', promise });
}
