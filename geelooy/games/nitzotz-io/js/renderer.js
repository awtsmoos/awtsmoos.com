// B"H
import { createPostFX } from './engine/postfx.js';
import { createScreenPass } from './engine/screen.js';
import { renderFrame } from './render/frame.js';
import { resizeCanvas } from './render/viewport.js';
import { createGL } from './webgl.js';

/**
 * Chapter X — The public renderer keeps the raw WebGL vessel visible to runtime
 * verification while the frame method preserves the focused rendering pipeline.
 */
export function createRenderer(canvas) {
	const core = createGL(canvas);
	const effects = createPostFX(core.gl);
	const screen = createScreenPass();
	const resize = postfx => resizeCanvas(canvas, core.gl, effects, Boolean(postfx));
	addEventListener('resize', () => resize(false));
	resize(false);
	return {
		gl: core.gl,
		meshes: core.meshes,
		locations: core.loc,
		resize,
		render(world) {
			const wantEffects = Boolean(world.save.postfx && world.performance?.postfx);
			if (effects.enabled !== wantEffects) resize(wantEffects);
			renderFrame(core, effects, screen, world, canvas);
		}
	};
}
