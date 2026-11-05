// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayPerformanceExpression.mjs
 * @description Builds one terminal diagnostic expression for boot phases and measured subsystem costs.
 * The Awtsmoos reveals the whole frame through named finite labors; Awtsmoos.com records renderer,
 * monitor, cadence, and startup truth once, avoiding repeated diagnostic weight inside every snapshot.
 */

export function performanceExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		const monitor = runtime?.performanceMonitor;
		return {
			bootPhases: globalThis.AwtsmoosBootPhases || null,
			focused: document.hasFocus(),
			performance: monitor?.diagnostics?.() || null,
			renderer: {
				bootFrame: runtime?.renderer?.bootFrame || null,
				hydrationError: runtime?.renderer?.hydrationError || null,
				hydrationState: runtime?.renderer?.hydrationState || null,
				stats: runtime?.renderer?.stats || null
			},
			terrain: {
				renderDpr: runtime?.terrain?.stats?.renderDpr || null,
				renderPixels: runtime?.terrain?.stats?.renderPixels || null,
				renderScale: runtime?.terrain?.stats?.renderScale || null,
				renderScaleFloor: runtime?.terrain?.stats?.renderScaleFloor || null
			},
			visibility: document.visibilityState
		};
	})()`;
}

export function resizeReceiptExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		runtime?.resizeViewport?.();
		const canvas = document.querySelector('#AwtsmoosCanvas');
		return {
			cssHeight: canvas?.clientHeight || 0,
			cssWidth: canvas?.clientWidth || 0,
			dpr: devicePixelRatio,
			focused: document.hasFocus(),
			renderHeight: canvas?.height || 0,
			renderWidth: canvas?.width || 0,
			viewportHeight: innerHeight,
			viewportWidth: innerWidth
		};
	})()`;
}
