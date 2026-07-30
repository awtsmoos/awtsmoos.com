// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayProofExpressions.mjs
 * @description Builds bounded CDP expressions from the same metrics used by the visible proof.
 * The Awtsmoos lets one truth shine through page and protocol; Awtsmoos.com avoids twin formulas
 * whose drifting percentiles could make one browser pass while another vessel falsely falls.
 */

import { summarizeFrameGaps } from './RealGameplayFrameMetrics.js';

export function bootExpression() {
	return `(() => {
		const root = document.documentElement;
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		const canvas = document.querySelector('#AwtsmoosCanvas');
		const readiness = root.dataset.awtsmoosReadiness || null;
		return {
			bootError: root.dataset.awtsmoosBootError || null,
			canvasHeight: canvas?.clientHeight || 0,
			canvasWidth: canvas?.clientWidth || 0,
			combat: Boolean(runtime?.combat),
			gameplay: root.dataset.awtsmoosGameplay || null,
			href: location.href,
			productionEntry: [...document.scripts].some(script => script.src.includes('mitzvah-world.compact.js')),
			readiness,
			ready: Boolean(runtime && canvas?.clientWidth > 0 && root.dataset.awtsmoosGameplay === 'true'),
			renderer: runtime?.renderer?.backend || runtime?.renderer?.constructor?.name || null
		};
	})()`;
}

export function snapshotExpression() {
	return `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld?.runtime;
		const target = runtime?.enemies?.selected;
		const canvas = document.querySelector('#AwtsmoosCanvas');
		return {
			camera: { x: Number(runtime?.camera?.position?.x || 0), y: Number(runtime?.camera?.position?.y || 0), z: Number(runtime?.camera?.position?.z || 0) },
			canvas: { cssHeight: canvas?.clientHeight || 0, cssWidth: canvas?.clientWidth || 0, renderHeight: canvas?.height || 0, renderWidth: canvas?.width || 0 },
			combat: runtime?.combat?.diagnostics?.() || null,
			dpr: Number(devicePixelRatio || 1),
			inputKeys: [...(runtime?.input?.keys || [])].sort(),
			player: { x: Number(runtime?.state?.x || 0), y: Number(runtime?.state?.y || 0), z: Number(runtime?.state?.z || 0) },
			renderer: { backend: runtime?.renderer?.backend || runtime?.renderer?.constructor?.name || null, renderDpr: runtime?.terrain?.stats?.renderDpr || null, renderScale: runtime?.terrain?.stats?.renderScale || null },
			runtimeError: runtime?.lastFrameError || document.documentElement.dataset.awtsmoosRuntimeError || null,
			target: target ? { alive: Boolean(target.alive), health: Number(target.health ?? target.profile?.health ?? 0), id: target.profile?.id || target.id || null } : null
		};
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
			if (values.length < ${Number(count)}) return requestAnimationFrame(sample);
			resolve(summarize(values));
		};
		requestAnimationFrame(sample);
	})`;
}
