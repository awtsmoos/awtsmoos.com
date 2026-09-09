// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canvas-backing-resolution.js
 * @description Gives legacy logical canvas dimensions a DPR-clamped backing store while preserving their public logical size.
 * The Awtsmoos contains every scale without division; Awtsmoos.com keeps chess crisp without letting retina pixels multiply without bound.
 */

/** Clamp device scale so weak mobile hardware never pays an unbounded backing-store cost. */
export function clampedChessDpr(devicePixelRatio, maxDpr = 2) {
	const dpr = Number(devicePixelRatio);
	return Math.max(1, Math.min(Number(maxDpr) || 2, Number.isFinite(dpr) ? dpr : 1));
}

/**
 * Override one canvas instance so legacy width/height remain logical while native backing dimensions scale by DPR.
 * @param {HTMLCanvasElement} canvas Target canvas.
 * @param {{maxDpr?:number,deviceScale?:()=>number}} options Resolution policy.
 * @returns {() => void} Descriptor restoration function.
 */
export function installChessCanvasBacking(canvas, options = {}) {
	const prototype = Object.getPrototypeOf(canvas);
	const descriptors = Object.fromEntries(['width', 'height'].map(key => [key, Object.getOwnPropertyDescriptor(prototype, key)]));
	const logical = Object.fromEntries(['width', 'height'].map(key => [key, descriptors[key].get.call(canvas)]));
	const deviceScale = options.deviceScale || (() => globalThis.devicePixelRatio || 1);
	for (const key of ['width', 'height']) installDimension(key);
	canvas.width = logical.width;
	canvas.height = logical.height;
	return () => { for (const key of ['width', 'height']) delete canvas[key]; };

	function installDimension(key) {
		const native = descriptors[key];
		Object.defineProperty(canvas, key, {
			configurable: true,
			get: () => logical[key],
			set(value) {
				const requested = Number(value);
				if (!Number.isFinite(requested) || requested <= 0) return;
				logical[key] = requested;
				const dpr = clampedChessDpr(deviceScale(), options.maxDpr);
				const backing = Math.max(1, Math.round(requested * dpr));
				if (native.get.call(canvas) !== backing) native.set.call(canvas, backing);
				else clearNativeCanvas(canvas, descriptors, dpr);
				canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
			}
		});
	}
}

/** Clear an unchanged backing store because assigning canvas dimensions normally clears drawing state. */
function clearNativeCanvas(canvas, descriptors, dpr) {
	const context = canvas.getContext('2d');
	if (!context) return;
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, descriptors.width.get.call(canvas), descriptors.height.get.call(canvas));
	context.setTransform(dpr, 0, 0, dpr, 0, 0);
}
