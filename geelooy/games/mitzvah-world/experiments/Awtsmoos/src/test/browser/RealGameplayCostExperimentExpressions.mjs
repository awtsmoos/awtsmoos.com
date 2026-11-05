// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayCostExperimentExpressions.mjs
 * @description Builds reversible browser expressions that isolate rendering and world-system cost.
 * The Awtsmoos remains whole while one finite labor rests for a measured breath; Awtsmoos.com
 * restores every method after each experiment so diagnosis never becomes silent feature deletion.
 */

export function disableRenderExpression() {
	return toggleExpression(
		'render',
		'runtime.renderer',
		'() => undefined'
	);
}

export function disableWorldSystemsExpression() {
	return toggleExpression(
		'updateWorldSystems',
		'runtime',
		'() => undefined'
	);
}

export function restoreExperimentExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		const originals = runtime?.__awtsmoosCostExperimentOriginals;
		if (!runtime || !originals) return false;
		if (originals.render) runtime.renderer.render = originals.render;
		if (originals.updateWorldSystems) {
			runtime.updateWorldSystems = originals.updateWorldSystems;
		}
		delete runtime.__awtsmoosCostExperimentOriginals;
		return true;
	})()`;
}

export function runtimeShapeExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		return {
			enemies: runtime?.enemies?.items?.length
				|| runtime?.enemies?.actors?.length
				|| runtime?.enemies?.length
				|| null,
			rendererStats: runtime?.renderer?.stats || null,
			updateWorldSystems: typeof runtime?.updateWorldSystems,
			worldSystems: runtime?.worldSystemsDiagnostics?.() || null
		};
	})()`;
}

function toggleExpression(method, ownerExpression, replacement) {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		if (!runtime) return false;
		const owner = ${ownerExpression};
		if (!owner || typeof owner.${method} !== 'function') return false;
		runtime.__awtsmoosCostExperimentOriginals ||= {};
		runtime.__awtsmoosCostExperimentOriginals.${method} = owner.${method};
		owner.${method} = ${replacement};
		return true;
	})()`;
}
