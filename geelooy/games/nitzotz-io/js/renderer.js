// B"H
import { createPostFX } from './engine/postfx.js';
import { createScreenPass } from './engine/screen.js';
import { renderFrame } from './render/frame.js';
import { resizeCanvas } from './render/viewport.js';
import { createGL } from './webgl.js';

/**
 * B"H
 * Renderer shell: resize, frame, and the silence between frames are separated.
 */
export function createRenderer(canvas) {
  const renderer = createGL(canvas);
  const fx = createPostFX(renderer.gl);
  const screen = createScreenPass();
  const resize = postfx => resizeCanvas(canvas, renderer.gl, fx, !!postfx);
  addEventListener('resize', () => resize(false));
  resize(false);
  return {
    resize,
    render(world) {
      if (fx.enabled !== !!world.save.postfx) resize(world.save.postfx);
      renderFrame(renderer, fx, screen, world, canvas);
    }
  };
}
