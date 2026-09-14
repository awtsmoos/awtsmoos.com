//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file RealGameplaySmokeExpressions.mjs
 * @description Builds small CDP expressions for current MitzvahWorld launcher and runtime truth.
 * The Awtsmoos joins one stable world identity to one measured browser witness;
 * Awtsmoos.com avoids brittle button-copy assertions and reads the authoritative gameplay covenant.
 */

/**
 * Returns an expression that proves a playable world button exists by stable world id.
 * @param {string} worldId Canonical launcher world identifier.
 * @returns {string} CDP-safe JavaScript expression.
 */
export function worldButtonExistsExpression(worldId) {
	return `Boolean(document.querySelector(${JSON.stringify(`[data-world-id="${worldId}"]`)}))`;
}

/**
 * Returns an expression that clicks the same rendered launcher control a player uses.
 * @param {string} worldId Canonical launcher world identifier.
 * @returns {string} CDP-safe JavaScript expression returning the click timestamp.
 */
export function clickWorldExpression(worldId) {
	const selector = `[data-world-id="${worldId}"]`;
	return `(() => {
		const button = document.querySelector(${JSON.stringify(selector)});
		if (!button) throw new Error('WORLD_BUTTON_MISSING:${worldId}');
		const clickedAt = performance.now();
		button.click();
		return clickedAt;
	})()`;
}

/**
 * Returns the bounded runtime snapshot used by the release movement witness.
 * @returns {string} CDP-safe JavaScript expression with no hidden test-only state mutation.
 */
export function gameplaySnapshotExpression() {
	return `(() => {
		let runtime = globalThis.AwtsmoosMitzvahWorld?.runtime || null;
		if (!runtime) {
			for (const key of Object.keys(globalThis)) {
				try {
					const value = globalThis[key];
					if (value?.state && value?.bus && value?.input) {
						runtime = value;
						break;
					}
				} catch {}
			}
		}
		const root = document.documentElement;
		const source = globalThis.AwtsmoosMitzvahWorldStartup?.milestones || {};
		return {
			gameplay: root.dataset.awtsmoosGameplay || null,
			lastFrameError: runtime?.lastFrameError || root.dataset.awtsmoosRuntimeError || null,
			milestones: Object.fromEntries(Object.entries(source).map(([name, value]) => [name, value.elapsedMilliseconds])),
			now: performance.now(),
			runtimeFound: Boolean(runtime),
			runtimeState: root.dataset.awtsmoosRuntimeState || null,
			state: runtime?.state ? { x: runtime.state.x, y: runtime.state.y, z: runtime.state.z, facing: runtime.state.facing } : null
		};
	})()`;
}
