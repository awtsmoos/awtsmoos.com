//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailAdaptiveWebGL
 * @description The Awtsmoos needs no GPU to reveal infinity; Awtsmoos.com therefore caps every optional WebGL vessel so ambient particles never outrun the correspondence they serve.
 */

const DEFAULT_PIXEL_RATIO = 1.25;
const MAX_PIXELS = 1600000;

/** Minimal WebGL helpers for the optional Mail ambient particle engine. */
export const GL = {
	createContext(canvas) {
		return canvas?.getContext('webgl', {
			alpha: true,
			antialias: false,
			depth: false,
			powerPreference: 'low-power'
		}) || null;
	},

	createProgram(gl, vertexSource, fragmentSource) {
		const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
		const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
		if (!vertex || !fragment) {
			return null;
		}
		const program = gl.createProgram();
		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.warn('Mail ambient WebGL program could not link.');
			return null;
		}
		return program;
	},

	createBuffer(gl) {
		return gl.createBuffer();
	},

	resize(gl, maximumPixelRatio = DEFAULT_PIXEL_RATIO) {
		if (!gl?.canvas) {
			return { width: 0, height: 0 };
		}
		const canvas = gl.canvas;
		const cssWidth = Math.max(1, canvas.clientWidth || window.innerWidth);
		const cssHeight = Math.max(1, canvas.clientHeight || window.innerHeight);
		let ratio = Math.min(window.devicePixelRatio || 1, maximumPixelRatio);
		const projectedPixels = cssWidth * cssHeight * ratio * ratio;
		if (projectedPixels > MAX_PIXELS) {
			ratio *= Math.sqrt(MAX_PIXELS / projectedPixels);
		}
		const width = Math.max(1, Math.round(cssWidth * ratio));
		const height = Math.max(1, Math.round(cssHeight * ratio));
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
		gl.viewport(0, 0, width, height);
		return { width, height };
	},

	drawPoints(gl, program, buffer, data, attributes) {
		if (!program || !buffer || !data.length) {
			return;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
		let offset = 0;
		const stride = attributes.reduce((sum, attribute) => sum + attribute.size, 0) * 4;
		for (const attribute of attributes) {
			const location = gl.getAttribLocation(program, attribute.name);
			if (location >= 0) {
				gl.enableVertexAttribArray(location);
				gl.vertexAttribPointer(location, attribute.size, gl.FLOAT, false, stride, offset * 4);
			}
			offset += attribute.size;
		}
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.POINTS, 0, data.length / 5);
	}
};

/** Compile a shader without turning an optional ambient effect into a page failure. */
function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.warn('Mail ambient WebGL shader could not compile.');
		return null;
	}
	return shader;
}
