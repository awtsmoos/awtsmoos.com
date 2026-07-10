// B"H
/** WebGL utility vessels: types explicit, uniforms named, no hidden engine. */
export function drawMode(gl, mode) {
	return {
		0: gl.POINTS,
		1: gl.LINES,
		2: gl.LINE_LOOP,
		3: gl.LINE_STRIP,
		4: gl.TRIANGLES,
		5: gl.TRIANGLE_STRIP,
		6: gl.TRIANGLE_FAN
	}[mode ?? 4] || gl.TRIANGLES;
}

export function attributeType(gl, attribute) {
	const array = attribute.array;
	if (array instanceof Float32Array) return gl.FLOAT;
	if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
	if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (array instanceof Uint32Array) return gl.UNSIGNED_INT;
	if (array instanceof Int8Array) return gl.BYTE;
	if (array instanceof Int16Array) return gl.SHORT;
	return gl.FLOAT;
}

export function createShader(gl, type, source, label, errors) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	const info = gl.getShaderInfoLog(shader);
	if (info) errors.push(`${label} shader: ${info}`);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`${label} shader failed: ${info}`);
	}
	return shader;
}

export function createProgram(gl, vertexSource, fragmentSource, label, errors) {
	const program = gl.createProgram();
	gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource, label, errors));
	gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, label, errors));
	gl.linkProgram(program);
	const info = gl.getProgramInfoLog(program);
	if (info) errors.push(`${label} program: ${info}`);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`${label} program failed: ${info}`);
	}
	return program;
}

export function locations(gl, program) {
	const attribute = (name) => gl.getAttribLocation(program, name);
	const uniform = (name) => gl.getUniformLocation(program, name);
	return {
		position: attribute('aPosition'),
		normal: attribute('aNormal'),
		color: attribute('aColor'),
		uv: attribute('aUv'),
		joints: attribute('aJoints'),
		weights: attribute('aWeights'),
		mvp: uniform('uMvp'),
		model: uniform('uModel'),
		colorUniform: uniform('uColor'),
		alphaCutoff: uniform('uAlphaCutoff'),
		alphaMode: uniform('uAlphaMode'),
		lit: uniform('uLit'),
		pointSize: uniform('uPointSize'),
		map: uniform('uMap'),
		useMap: uniform('uUseMap'),
		mapRepeat: uniform('uMapRepeat'),
		mixMap: uniform('uMixMap'),
		useMixMap: uniform('uUseMixMap'),
		mixRepeat: uniform('uMixRepeat'),
		mixStrength: uniform('uMixStrength'),
		mixPatchScale: uniform('uMixPatchScale'),
		mixPatchSharpness: uniform('uMixPatchSharpness'),
		grassReactive: uniform('uGrassReactive'),
		interactor: uniform('uInteractor'),
		grassRadius: uniform('uGrassRadius'),
		grassWindStrength: uniform('uGrassWindStrength'),
		time: uniform('uTime'),
		jointMatrices: uniform('uJointMatrices[0]'),
		jointTexture: uniform('uJointTexture'),
		jointTextureHeight: uniform('uJointTextureHeight')
	};
}

export function materialColor(material) {
	const color = material?.color || [0.75, 0.70, 0.62, 1];
	const opacity = material?.opacity ?? color[3] ?? 1;
	return new Float32Array([
		color[0] ?? 0.75,
		color[1] ?? 0.70,
		color[2] ?? 0.62,
		opacity
	]);
}

export function alphaModeCode(material) {
	if (material?.alphaMode === 'MASK') return 1;
	if (material?.alphaMode === 'BLEND') return 2;
	return 0;
}
