// B"H
import { bindMesh } from '../webgl.js';

/** B"H: One command, one vessel, one honest draw. */
export function drawCommand(renderer, command) {
  const gl = renderer.gl;
  const mesh = renderer.meshes[command.mesh] || renderer.meshes.cube;
  bindMesh(renderer, mesh);
  gl.uniform3fv(renderer.loc.uPos, command.pos);
  gl.uniform3fv(renderer.loc.uScale, command.scale);
  gl.uniform1f(renderer.loc.uRot, command.rot);
  gl.uniform3fv(renderer.loc.uColor, command.color);
  gl.uniform1f(renderer.loc.uAlpha, command.alpha);
  gl.uniform1f(renderer.loc.uGlow, command.glow);
  gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
}
