// B"H
import { skeletonLinePositions } from './tiny-skin-system.js';

/** Draws optional skeleton guides without contaminating normal mesh paths. */
export function drawSkeleton(renderer, scene, projectionView) {
	const gl = renderer.gl;
	const points = skeletonLinePositions(scene);
	if (!points.length) return false;
	if (!renderer.skeletonBuffer) renderer.skeletonBuffer = gl.createBuffer();
	const locations = renderer.loc.rigid;
	gl.useProgram(renderer.programs.rigid);
	gl.bindBuffer(gl.ARRAY_BUFFER, renderer.skeletonBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);
	gl.enableVertexAttribArray(locations.position);
	gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
	renderer.buffers.bindAttribute(locations.normal, null, null, [0, 1, 0, 0]);
	renderer.buffers.bindAttribute(locations.color, null, null, [1, 1, 1, 1]);
	renderer.buffers.bindAttribute(locations.uv, null, null, [0, 0, 0, 1]);
	gl.uniformMatrix4fv(locations.mvp, false, projectionView);
	gl.uniformMatrix4fv(locations.model, false, renderer.identityMatrix);
	gl.uniform4fv(locations.colorUniform, new Float32Array([0.2, 1, 0.9, 1]));
	gl.uniform1f(locations.alphaCutoff, 0.5);
	gl.uniform1i(locations.alphaMode, 0);
	gl.uniform1i(locations.lit, 0);
	gl.uniform1f(locations.pointSize, 1);
	renderer.textures.bind(locations, null, renderer.stats);
	gl.drawArrays(gl.LINES, 0, points.length / 3);
	renderer.stats.skeletonSegments = points.length / 6;
	return true;
}
