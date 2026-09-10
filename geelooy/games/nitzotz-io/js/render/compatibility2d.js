//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file compatibility2d.js
 * @description Provides a real Canvas2D rendering vessel when WebGL allocation is
 * unavailable, while leaving Nitzotz simulation, input, progression, and results unchanged.
 *
 * Architectural invariants:
 * - Rendering never mutates authoritative world gameplay state.
 * - The player remains centered while nearby arena objects move relative to it.
 * - Visible-object work is bounded so fallback mode remains useful on weak devices.
 * - Diagnostics expose the degraded renderer explicitly instead of throwing.
 */

import { drawCompatibilityScene } from './compatibility2d-scene.js';

/**
 * Creates the compatibility renderer over an already acquired 2D context.
 * @param {HTMLCanvasElement} canvas Canvas shared with the normal renderer doorway.
 * @param {CanvasRenderingContext2D} context Working 2D drawing context.
 * @param {Error} reason Original WebGL allocation failure retained for diagnostics.
 * @returns {object} Renderer implementing the same render/resize diagnostic surface.
 */
export function createCompatibility2DRenderer(canvas, context, reason) {
	let activeWorld = null;

	return {
		kind: 'canvas2d-compatibility',
		gl: null,
		textures: null,
		compatibilityReason: reason?.message || 'WebGL unavailable',
		resize() {
			resizeCanvas(canvas);
		},
		render(world) {
			activeWorld = world;
			resizeCanvas(canvas);
			drawCompatibilityScene(context, canvas, activeWorld);
		}
	};
}

/** Keep backing pixels aligned to the current CSS box without exceeding 2× DPR. */
function resizeCanvas(canvas) {
	const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
	const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
	const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
	if (canvas.width !== width) {
		canvas.width = width;
	}
	if (canvas.height !== height) {
		canvas.height = height;
	}
}
