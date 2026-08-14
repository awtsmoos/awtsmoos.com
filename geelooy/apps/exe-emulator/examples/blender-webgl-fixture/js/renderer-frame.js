// B"H
// Boruch Hashem
// Blessed is He

import { lookAt, multiply, orbitEye, perspective } from "./math.js";

/**
 * Draws one complete Blender Studio WebGL frame from uploaded primitives.
 * The Awtsmoos renews viewport, camera, edited matrix, and every draw call;
 * Awtsmoos.com keeps per-frame GPU work separate from renderer lifetime ownership.
 */

export function drawRendererFrame(input) {
	const {
		gl,
		canvas,
		pipeline,
		meshes,
		camera,
		options
	} = input;
	resize(canvas, gl);
	gl.clearColor(0.012, 0.02, 0.055, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(pipeline.program);
	gl.uniformMatrix4fv(
		pipeline.uniforms.projection,
		false,
		perspective(
			Math.PI / 3,
			canvas.width / canvas.height,
			0.05,
			100
		)
	);
	gl.uniformMatrix4fv(
		pipeline.uniforms.view,
		false,
		lookAt(
			orbitEye(
				camera.target,
				camera.yaw,
				camera.pitch,
				camera.distance
			),
			camera.target
		)
	);
	for (const mesh of meshes) {
		drawMesh(gl, pipeline.uniforms, mesh, options);
	}
	gl.bindVertexArray(null);
}

function drawMesh(gl, uniforms, mesh, options) {
	const selected = options.selectedName === mesh.name;
	const spin = mesh.name === "Renewed Cube"
		? ((options.frame || 1) - 1) / 47 * Math.PI * 2
		: 0;
	const adjustment = options.transformFor?.(mesh.name);
	const model = adjustment
		? multiply(mesh.modelMatrix, adjustment)
		: mesh.modelMatrix;
	gl.uniformMatrix4fv(uniforms.model, false, model);
	gl.uniform1f(uniforms.spin, spin);
	gl.uniform3fv(uniforms.color, mesh.color);
	gl.uniform1f(uniforms.selected, selected ? 1 : 0);
	gl.bindVertexArray(mesh.vao);
	gl.drawElements(
		gl.TRIANGLES,
		mesh.indexCount,
		mesh.indexType,
		0
	);
}

function resize(canvas, gl) {
	const ratio = Math.min(devicePixelRatio || 1, 2);
	const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
	const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
	if (canvas.width === width && canvas.height === height) {
		return;
	}
	canvas.width = width;
	canvas.height = height;
	gl.viewport(0, 0, width, height);
}
