// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayProofExpressions.mjs
 * @description Builds bounded boot, keyboard, and frame-measurement expressions for CDP proof.
 * The Awtsmoos lets one truth shine through protocol and page; Awtsmoos.com keeps every expression
 * readable and names each readiness gate so a timeout reveals its actual unfinished vessel.
 */

import { summarizeFrameGaps } from './RealGameplayFrameMetrics.js';

export function bootExpression() {
	return `(() => {
		const root = document.documentElement;
		const diagnostics = globalThis.AwtsmoosMitzvahWorld;
		const runtime = diagnostics?.runtime;
		const canvas = document.querySelector('#AwtsmoosCanvas');
		const navigation = performance.getEntriesByType('navigation')[0];
		return {
			bootError: root.dataset.awtsmoosBootError || null,
			bootPhases: diagnostics?.bootPhases?.() || globalThis.AwtsmoosBootPhases || null,
			bootStage: root.dataset.awtsmoosBootStage || null,
			canvasHeight: canvas?.clientHeight || 0,
			canvasWidth: canvas?.clientWidth || 0,
			combat: Boolean(runtime?.combat),
			features: root.dataset.awtsmoosFeatures || null,
			featureReceipt: runtime?.featureReceipt || null,
			featuresPromise: promiseState(runtime?.featuresPromise),
			focused: document.hasFocus(),
			gameplay: root.dataset.awtsmoosGameplay || null,
			href: location.href,
			navigation: navigation ? {
				domContentLoadedMs: navigation.domContentLoadedEventEnd,
				loadMs: navigation.loadEventEnd,
				responseEndMs: navigation.responseEnd,
				startTime: navigation.startTime
			} : null,
			productionEntry: [...document.scripts].some(script => (
				script.src.includes('mitzvah-world.compact.js')
			)),
			readiness: root.dataset.awtsmoosReadiness || null,
			readinessFlow: promiseState(diagnostics?.readinessFlow),
			ready: Boolean(
				runtime
				&& canvas?.clientWidth > 0
				&& root.dataset.awtsmoosGameplay === 'true'
			),
			renderer: runtime?.renderer?.backend
				|| runtime?.renderer?.constructor?.name
				|| null,
			rendererHydration: root.dataset.awtsmoosRendererHydration || null,
			runtimeState: root.dataset.awtsmoosRuntimeState || null,
			visibility: document.visibilityState
		};
		function promiseState(value) {
			if (!value || typeof value.then !== 'function') return value ? 'value' : 'absent';
			return 'pending-or-settled-promise';
		}
	})()`;
}

export function keyExpression(type, code, key = '') {
	return `(() => {
		const event = new KeyboardEvent(${JSON.stringify(type)}, {
			bubbles: true,
			cancelable: true,
			code: ${JSON.stringify(code)},
			key: ${JSON.stringify(key || code)}
		});
		window.dispatchEvent(event);
		document.dispatchEvent(event);
		return true;
	})()`;
}

export function frameExpression(count = 180) {
	return `new Promise(resolve => {
		const summarize = ${summarizeFrameGaps.toString()};
		const values = [];
		let prior = performance.now();
		const sample = now => {
			values.push(now - prior);
			prior = now;
			if (values.length < ${Number(count)}) {
				requestAnimationFrame(sample);
				return;
			}
			resolve(summarize(values));
		};
		requestAnimationFrame(sample);
	})`;
}
