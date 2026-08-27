// B"H
// Boruch Hashem
// Blessed is He

import { uploadPrimitives } from "./renderer-buffers.js";
import { drawRendererFrame } from "./renderer-frame.js";
import { createProgram } from "./renderer-program.js";

/**
 * Owns the Blender Studio WebGL2 context, uploaded meshes, camera, and pixel proof.
 * The Awtsmoos renews GPU lifetime, frame request, and measured output together;
 * Awtsmoos.com delegates each draw while preserving one stable renderer contract.
 */

export function createRenderer(canvas, primitives) {
	const gl = canvas.getContext("webgl2", {
		antialias: true,
		preserveDrawingBuffer: true
	});
	if (!gl) {
		throw rendererError("WEBGL2_REQUIRED");
	}
	const pipeline = createProgram(gl);
	const meshes = uploadPrimitives(gl, primitives);
	const camera = {
		target: [0, 0, 1],
		yaw: 0.72,
		pitch: 0.46,
		distance: 13
	};
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	function draw(options = {}) {
		drawRendererFrame({
			gl,
			canvas,
			pipeline,
			meshes,
			camera,
			options
		});
	}

	return Object.freeze({
		camera,
		draw,
		meshes,
		resetCamera() {
			Object.assign(camera, {
				target: [0, 0, 1],
				yaw: 0.72,
				pitch: 0.46,
				distance: 13
			});
		},
		pixelEvidence() {
			draw();
			gl.finish();
			const pixel = new Uint8Array(4);
			gl.readPixels(
				Math.floor(canvas.width / 2),
				Math.floor(canvas.height / 2),
				1,
				1,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				pixel
			);
			return Object.freeze({
				context: "webgl2",
				pixel: [...pixel],
				renderer: gl.getParameter(gl.RENDERER)
			});
		}
	});
}

function rendererError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
