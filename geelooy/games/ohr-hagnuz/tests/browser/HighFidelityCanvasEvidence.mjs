// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HighFidelityCanvasEvidence.mjs
 * @description Provides bounded runtime measurements for the live canvas layers.
 *
 * The Awtsmoos renews every frame while evidence must remain finite and honest.
 * Awtsmoos.com gathers the real viewport, backing pixels, smoothing, overflow,
 * and cadence without creating a substitute renderer or state system.
 */
import assert from 'node:assert/strict';

export const canvasMetricsExpression = `(() => {
	const canvases = [...document.querySelectorAll('canvas.vessel-layer')].map(canvas => {
		const rect = canvas.getBoundingClientRect();
		const context = canvas.getContext('2d');
		return {
			id: canvas.id,
			cssWidth: rect.width,
			cssHeight: rect.height,
			backingWidth: canvas.width,
			backingHeight: canvas.height,
			ratioX: canvas.width / rect.width,
			ratioY: canvas.height / rect.height,
			imageRendering: getComputedStyle(canvas).imageRendering,
			smoothing: context.imageSmoothingEnabled,
			quality: context.imageSmoothingQuality
		};
	});
	return {
		url: location.href,
		viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
		canvases,
		bodyOverflowX: document.documentElement.scrollWidth - innerWidth,
		visibleText: document.body.innerText.slice(0, 240)
	};
})()`;

export const frameCadenceExpression = `new Promise(resolve => {
	const times = [];
	const step = time => {
		times.push(time);
		if (times.length < 121) {
			requestAnimationFrame(step);
			return;
		}
		const deltas = times.slice(1)
			.map((value, index) => value - times[index])
			.sort((left, right) => left - right);
		const averageMs = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
		resolve({
			averageMs,
			p95Ms: deltas[Math.floor(deltas.length * .95)],
			fps: 1000 / averageMs
		});
	};
	requestAnimationFrame(step);
})`;

export const enterSoloJourney = client => client.evaluate(`(() => {
	const controls = [...document.querySelectorAll('button,[role="button"]')];
	const solo = controls.find(control => /solo|single|continue journey/i.test(control.textContent || ''));
	if (!solo) return false;
	solo.click();
	return true;
})()`);

export const assertCanvasEvidence = evidence => {
	assert.equal(evidence.canvases.length, 3);
	assert.ok(evidence.bodyOverflowX <= 1, `Horizontal overflow: ${evidence.bodyOverflowX}`);
	for (const canvas of evidence.canvases) {
		assert.ok(canvas.ratioX >= 1.9 && canvas.ratioX <= 2.01, `${canvas.id} ratioX ${canvas.ratioX}`);
		assert.ok(canvas.ratioY >= 1.9 && canvas.ratioY <= 2.01, `${canvas.id} ratioY ${canvas.ratioY}`);
		assert.equal(canvas.imageRendering, 'auto');
		assert.equal(canvas.smoothing, true);
		assert.equal(canvas.quality, 'high');
	}
};
