//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file renderer.js
 * @description Selects the richest available Nitzotz renderer while preserving
 * one stable render/resize/diagnostic contract for the page and debug witnesses.
 *
 * Architectural invariants:
 * - WebGL remains the preferred renderer and retains the existing visual pipeline.
 * - A denied WebGL context degrades to playable Canvas2D instead of aborting boot.
 * - Simulation state never depends on the selected rendering vessel.
 * - Renderer identity is explicit so diagnostics never infer capabilities indirectly.
 *
 * Failure behavior:
 * - If neither WebGL nor Canvas2D can be allocated, the original WebGL failure escapes.
 * - PostFX and framebuffer resources are created only after WebGL succeeds.
 */
import { createPostFX } from './engine/postfx.js';
import { createScreenPass } from './engine/screen.js';
import { createCompatibility2DRenderer } from './render/compatibility2d.js';
import { renderFrame } from './render/frame.js';
import { resizeCanvas, viewportSignature } from './render/viewport.js';
import { createGL } from './webgl.js';

/**
 * Create the richest renderer supported by the current browser/GPU process.
 * @param {HTMLCanvasElement} canvas Canonical gameplay canvas.
 * @returns {object} Stable renderer contract used by the game loop and diagnostics.
 */
export function createRenderer(canvas) {
	let core;
	try {
		core = createGL(canvas);
	} catch (error) {
		const context = canvas.getContext('2d');
		if (!context) {
			throw error;
		}
		return createCompatibility2DRenderer(canvas, context, error);
	}
	return createWebGLRenderer(canvas, core);
}

/** Build the established WebGL renderer after context creation succeeds. */
function createWebGLRenderer(canvas, core) {
	const effects = createPostFX(core.gl);
	const screen = createScreenPass();
	let activeWorld = null;
	let lastSignature = '';

	function settingsFor(world) {
		return {
			preset: world?.save?.perf || 'medium',
			resolutionScale: world?.performance?.resolutionScale ?? 1,
			postfx: Boolean(world?.save?.postfx && world?.performance?.postfx)
		};
	}

	function resize(world = activeWorld, force = false) {
		const settings = settingsFor(world);
		const signature = viewportSignature(settings);
		if (!force && signature === lastSignature) {
			return;
		}
		lastSignature = signature;
		resizeCanvas(canvas, core.gl, effects, settings);
	}

	window.addEventListener('resize', () => resize(activeWorld, true));
	resize(null, true);

	return {
		kind: 'webgl',
		compatibilityReason: null,
		gl: core.gl,
		meshes: core.meshes,
		locations: core.loc,
		textures: core.textures,
		resize: () => resize(activeWorld, true),
		render(world) {
			activeWorld = world;
			resize(world);
			renderFrame(core, effects, screen, world, canvas);
		}
	};
}
