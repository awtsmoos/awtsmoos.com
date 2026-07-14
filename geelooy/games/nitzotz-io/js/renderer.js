// B"H
// Boruch Hashem
// Blessed is He
import { createPostFX } from './engine/postfx.js';
import { createScreenPass } from './engine/screen.js';
import { renderFrame } from './render/frame.js';
import { resizeCanvas, viewportSignature } from './render/viewport.js';
import { createGL } from './webgl.js';

/**
 * The Awtsmoos pours one world through changing visual vessels. Firebase texture
 * diagnostics remain visible while framebuffer garments rebuild only when necessary.
 */
export function createRenderer(canvas) {
	const core = createGL(canvas);
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
		if (!force && signature === lastSignature) return;
		lastSignature = signature;
		resizeCanvas(canvas, core.gl, effects, settings);
	}

	window.addEventListener('resize', () => resize(activeWorld, true));
	resize(null, true);

	return {
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
