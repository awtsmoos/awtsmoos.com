// B"H
import { buildRenderList } from '../engine/renderList.js';
import { updateStats } from '../engine/stats.js';
import { drawCommand } from './draw.js';
import { viewProjection } from './matrix.js';

/** B"H: The frame is renewed from nothing, then returned to nothing. */
export function renderFrame(renderer, fx, screen, world, canvas) {
  const gl = renderer.gl;
  const commands = buildRenderList(world, performance.now() * 0.001);
  fx.begin();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.018, 0.012, 0.045, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(renderer.program);
  gl.uniformMatrix4fv(renderer.loc.uVP, false, new Float32Array(viewProjection(canvas, world.camera, world.player)));
  for (const command of commands) drawCommand(renderer, command);
  const texture = fx.end();
  if (fx.enabled) screen.draw(gl, texture);
  updateStats(world, commands.length, fx.enabled ? 'postfx' : 'direct');
}
