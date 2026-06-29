// B"H
import { createPostFX } from './engine/postfx.js';
import { createScreenPass } from './engine/screen.js';
import { renderFrame } from './render/frame.js';
import { resizeCanvas } from './render/viewport.js';
import { createGL } from './webgl.js';

/** B"H: PostFX is now conditional mercy, not a permanent burden. */
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
      const wantFx = !!world.save.postfx && !!world.performance?.postfx;
      if (fx.enabled !== wantFx) resize(wantFx);
      renderFrame(renderer, fx, screen, world, canvas);
    }
  };
}
