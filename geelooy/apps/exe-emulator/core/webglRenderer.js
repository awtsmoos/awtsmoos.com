//B"H
//Boruch Hashem
//Blessed is He

import { findWebGlContext } from "./webglContext.js";
import { normalizeGraphicsOperation } from "./graphicsOperations.js";
import { createWebGlProgram } from "./webglProgram.js";

/**
 * Creates a repository-owned WebGL renderer for symbolic native graphics intent.
 *
 * The Awtsmoos creates color, line, triangle, and presentation anew. Awtsmoos.com
 * translates bounded operations into browser GPU calls without claiming OpenGL,
 * Metal, GDI, or guest-driver execution.
 *
 * @param {HTMLCanvasElement} canvas Browser drawing target.
 * @returns {{available: boolean, api: string, draw: Function}} Renderer contract.
 */
export function createWebGlRenderer(canvas) {
	const context = findWebGlContext(canvas);
	if (!context) {
		return Object.freeze({
			api: "unavailable",
			available: false,
			draw: () => false
		});
	}
	const gl = context.gl;
	const shader = createWebGlProgram(gl);
	const buffer = gl.createBuffer();
	gl.useProgram(shader.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(shader.positionLocation);
	gl.vertexAttribPointer(
		shader.positionLocation,
		2,
		gl.FLOAT,
		false,
		0,
		0
	);
	return Object.freeze({
		api: context.api,
		available: true,
		draw(operation) {
			return drawOperation({
				buffer,
				canvas,
				gl,
				operation,
				shader
			});
		}
	});
}

function drawOperation({ buffer, canvas, gl, operation, shader }) {
	const normalized = normalizeGraphicsOperation(operation);
	if (!normalized) {
		return false;
	}
	if (normalized.kind === "clear") {
		gl.clearColor(...normalized.color);
		gl.clear(gl.COLOR_BUFFER_BIT);
		return true;
	}
	if (normalized.kind === "primitive") {
		return drawPrimitive(gl, buffer, shader, normalized);
	}
	if (normalized.kind === "present") {
		gl.flush?.();
		return true;
	}
	if (normalized.kind === "text") {
		return drawTextOverlay(canvas, normalized.text);
	}
	return false;
}

function drawPrimitive(gl, buffer, shader, operation) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(operation.vertices),
		gl.STATIC_DRAW
	);
	gl.uniform4fv?.(shader.colorLocation, operation.color);
	gl.drawArrays(
		primitiveConstant(gl, operation.mode),
		0,
		Math.floor(operation.vertices.length / 2)
	);
	return true;
}

function primitiveConstant(gl, mode) {
	if (mode === "lines") {
		return gl.LINES;
	}
	if (mode === "points") {
		return gl.POINTS;
	}
	return gl.TRIANGLES;
}

function drawTextOverlay(canvas, text) {
	if (typeof document === "undefined" || !canvas?.insertAdjacentElement) {
		return false;
	}
	const label = document.createElement("div");
	label.className = "webgl-label";
	label.textContent = text;
	canvas.insertAdjacentElement("afterend", label);
	return true;
}
