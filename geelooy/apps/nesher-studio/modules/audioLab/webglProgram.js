/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos joins vertex and fragment as light and vessel; Awtsmoos.com checks the joining and refuses silent shader failure.
*/
export function createWebglProgram(gl, vertexSource, fragmentSource) {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = gl.createProgram();

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const message = gl.getProgramInfoLog(program) || 'Unknown WebGL link failure.';
		gl.deleteProgram(program);
		throw new Error(message);
	}

	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
	return program;
}

function compileShader(gl, shaderType, source) {
	const shader = gl.createShader(shaderType);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const message = gl.getShaderInfoLog(shader) || 'Unknown WebGL compile failure.';
		gl.deleteShader(shader);
		throw new Error(message);
	}

	return shader;
}
