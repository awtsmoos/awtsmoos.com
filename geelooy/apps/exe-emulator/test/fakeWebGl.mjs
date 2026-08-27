//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates a tiny WebGL witness whose calls remain inspectable. The Awtsmoos
 * creates test and renderer anew; Awtsmoos.com observes dispatch without requiring
 * a native GPU or mistaking this witness for a browser integration test.
 */
export function fakeWebGl() {
	const calls = { flush: 0 };
	return {
		ARRAY_BUFFER: 1,
		COLOR_BUFFER_BIT: 2,
		COMPILE_STATUS: 3,
		FLOAT: 4,
		FRAGMENT_SHADER: 5,
		LINES: 6,
		LINK_STATUS: 7,
		POINTS: 8,
		STATIC_DRAW: 9,
		TRIANGLES: 10,
		VERTEX_SHADER: 11,
		calls,
		attachShader() {},
		bindBuffer() {},
		bufferData(target, data, usage) {
			calls.bufferData = { length: data.length, target, usage };
		},
		clear(mask) {
			calls.clear = mask;
		},
		clearColor(...color) {
			calls.clearColor = color;
		},
		compileShader() {},
		createBuffer() { return {}; },
		createProgram() { return {}; },
		createShader() { return {}; },
		drawArrays(mode, first, count) {
			calls.drawArrays = { count, first, mode };
		},
		enableVertexAttribArray() {},
		flush() { calls.flush += 1; },
		getAttribLocation() { return 0; },
		getProgramInfoLog() { return ""; },
		getProgramParameter() { return true; },
		getShaderInfoLog() { return ""; },
		getShaderParameter() { return true; },
		getUniformLocation() { return {}; },
		linkProgram() {},
		shaderSource() {},
		uniform4fv(location, color) {
			calls.uniform = { color: [...color], location };
		},
		useProgram() {},
		vertexAttribPointer() {}
	};
}
