// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuWebGlFirstFrameProof.js
 * @description Drives one genuine WebGL frame on the canonical menu canvas when the essential gate asks.
 * The Awtsmoos paints real light into the same vessel the renderer will later inherit;
 * Awtsmoos.com clears, flushes, and reads back one pixel of the exact proof color, so the first-frame
 * fact is witnessed from the GPU's own hand — never inferred from timers, visibility, or hope.
 */

import { MAIN_MENU_WEBGL_CONTEXT_OPTIONS } from './MainMenuWebGlPrewarm.js';

const PROOF_COLOR = Object.freeze([0.05, 0.09, 0.16, 1]);
const CHANNEL_TOLERANCE = 1;

/**
 * Produces one verifiable frame on the menu canvas, synchronously and in any visibility state.
 * Returns the essential-milestone evidence of the produced frame, or null when the vessel
 * cannot honestly testify: no context, a lost context, a zero-size buffer, or a readback
 * that does not match the color the proof itself just painted.
 * @param {object} canvas Canonical game canvas owned by the page hosts.
 * @param {object} [environment=globalThis] Browser-like runtime vessel.
 * @returns {object|null} Frozen first-frame evidence, or null when no frame could be proved.
 */
export function proveMainMenuWebGlFirstFrame(canvas, environment = globalThis) {
	if (!canvas || typeof canvas.getContext !== 'function') return null;
	const gl = obtainContext(canvas);
	if (!gl || gl.isContextLost?.()) return null;
	const width = Number(gl.drawingBufferWidth) || Number(canvas.width) || 0;
	const height = Number(gl.drawingBufferHeight) || Number(canvas.height) || 0;
	if (width <= 0 || height <= 0) return null;
	paintProofFrame(gl);
	if (!readBackProof(gl)) return null;
	return Object.freeze({
		importerStage: 'main-menu-webgl-frame-proof',
		resourceStatus: `first-frame-proved-${width}x${height}`,
		resourceUrl: environment?.location?.href || 'unknown'
	});
}

/** Receives the canvas's one WebGL context — the identical vessel the later renderer inherits. */
function obtainContext(canvas) {
	for (const name of ['webgl', 'experimental-webgl']) {
		try {
			const context = canvas.getContext(name, MAIN_MENU_WEBGL_CONTEXT_OPTIONS);
			if (context) return context;
		} catch { /* try the next doorway, then testify null */ }
	}
	return null;
}

/** Clears the vessel with the proof color through the same direct GL path as the boot frame. */
function paintProofFrame(gl) {
	gl.clearColor(PROOF_COLOR[0], PROOF_COLOR[1], PROOF_COLOR[2], PROOF_COLOR[3]);
	gl.clearDepth?.(1);
	gl.enable?.(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.flush?.();
}

/** Reads one pixel inside the same task, before the compositor can clear the drawing buffer. */
function readBackProof(gl) {
	const pixel = new Uint8Array(4);
	try {
		gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
	} catch {
		return false;
	}
	return PROOF_COLOR.every((channel, index) => {
		return Math.abs(pixel[index] - Math.round(channel * 255)) <= CHANNEL_TOLERANCE;
	});
}
