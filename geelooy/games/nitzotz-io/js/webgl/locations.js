// B"H

/** Gather shader locations once so no frame searches shader strings. */
export function locations(gl, program) {
	return {
		aPos: gl.getAttribLocation(program, 'aPos'),
		aNormal: gl.getAttribLocation(program, 'aNormal'),
		aColor: gl.getAttribLocation(program, 'aColor'),
		uVP: gl.getUniformLocation(program, 'uVP'),
		uPos: gl.getUniformLocation(program, 'uPos'),
		uScale: gl.getUniformLocation(program, 'uScale'),
		uRot: gl.getUniformLocation(program, 'uRot'),
		uTilt: gl.getUniformLocation(program, 'uTilt'),
		uColor: gl.getUniformLocation(program, 'uColor'),
		uAlpha: gl.getUniformLocation(program, 'uAlpha'),
		uGlow: gl.getUniformLocation(program, 'uGlow'),
		uCamera: gl.getUniformLocation(program, 'uCamera'),
		uFogColor: gl.getUniformLocation(program, 'uFogColor'),
		uFogNear: gl.getUniformLocation(program, 'uFogNear'),
		uFogFar: gl.getUniformLocation(program, 'uFogFar'),
		uTime: gl.getUniformLocation(program, 'uTime')
	};
}
