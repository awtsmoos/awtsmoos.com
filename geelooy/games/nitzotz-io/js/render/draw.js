// B"H
// Boruch Hashem
// Blessed is He
import { bindMesh } from '../webgl/context.js';

/**
 * The Awtsmoos binds one named garment before each procedural vessel is revealed.
 * Material caching prevents repeated remote-texture state changes inside a frame.
 */
export function drawCommand(renderer, command) {
	const { gl, loc, meshes, textures } = renderer;
	const mesh = meshes[command.mesh] || meshes.cube;
	bindMesh(renderer, mesh);
	textures.bind(command.material || 'none');
	gl.uniform3fv(loc.uPos, command.pos);
	gl.uniform3fv(loc.uScale, command.scale);
	gl.uniform1f(loc.uRot, command.rot);
	gl.uniform1f(loc.uTilt, command.tilt || 0);
	gl.uniform3fv(loc.uColor, command.color);
	gl.uniform1f(loc.uAlpha, command.alpha);
	gl.uniform1f(loc.uGlow, command.glow);
	gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
}
