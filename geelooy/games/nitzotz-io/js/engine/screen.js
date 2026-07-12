// B"H

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
	vUv = (aPosition + 1.0) * 0.5;
	gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
	vec3 color = texture2D(uTexture, vUv).rgb;
	float highlight = max(max(color.r, color.g), color.b);
	color = pow(color, vec3(0.86));
	color += color * highlight * 0.14;
	gl_FragColor = vec4(color, 1.0);
}
`;

/** Draw the completed arena texture without inheriting mesh-culling state. */
export function createScreenPass() {
	let program = null;
	let buffer = null;
	let position = -1;
	let textureLocation = null;

	return {
		draw(gl, texture) {
			if (!texture) return;
			if (!program) ({ program, buffer, position, textureLocation } = createResources(gl));
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.CULL_FACE);
			gl.disable(gl.BLEND);
			gl.useProgram(program);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.enableVertexAttribArray(position);
			gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(textureLocation, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
		}
	};
}

function createResources(gl) {
	const program = createProgram(gl);
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
	return {
		program,
		buffer,
		position: gl.getAttribLocation(program, 'aPosition'),
		textureLocation: gl.getUniformLocation(program, 'uTexture')
	};
}

function createProgram(gl) {
	const program = gl.createProgram();
	gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
	gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
	return program;
}

function compile(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
	return shader;
}
