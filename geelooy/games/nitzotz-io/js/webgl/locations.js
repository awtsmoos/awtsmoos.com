// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos names every shader doorway once. Primary, secondary, flow, light,
 * fog, haze, and transform values then pass without repeated location searches.
 */
export function locations(gl, program) {
	return {
		aPos: gl.getAttribLocation(program, 'aPos'),
		aNormal: gl.getAttribLocation(program, 'aNormal'),
		aColor: gl.getAttribLocation(program, 'aColor'),
		uVP: uniform(gl, program, 'uVP'),
		uPos: uniform(gl, program, 'uPos'),
		uScale: uniform(gl, program, 'uScale'),
		uRot: uniform(gl, program, 'uRot'),
		uTilt: uniform(gl, program, 'uTilt'),
		uColor: uniform(gl, program, 'uColor'),
		uAlpha: uniform(gl, program, 'uAlpha'),
		uGlow: uniform(gl, program, 'uGlow'),
		uCamera: uniform(gl, program, 'uCamera'),
		uFogColor: uniform(gl, program, 'uFogColor'),
		uFogNear: uniform(gl, program, 'uFogNear'),
		uFogFar: uniform(gl, program, 'uFogFar'),
		uSunDirection: uniform(gl, program, 'uSunDirection'),
		uSunColor: uniform(gl, program, 'uSunColor'),
		uAmbientColor: uniform(gl, program, 'uAmbientColor'),
		uHazeHeight: uniform(gl, program, 'uHazeHeight'),
		uHazeStrength: uniform(gl, program, 'uHazeStrength'),
		uTime: uniform(gl, program, 'uTime'),
		uTexture: uniform(gl, program, 'uTexture'),
		uSecondaryTexture: uniform(gl, program, 'uSecondaryTexture'),
		uTextureMix: uniform(gl, program, 'uTextureMix'),
		uSecondaryMix: uniform(gl, program, 'uSecondaryMix'),
		uTextureScale: uniform(gl, program, 'uTextureScale'),
		uMaterialMode: uniform(gl, program, 'uMaterialMode'),
		uTextureFlow: uniform(gl, program, 'uTextureFlow')
	};
}

function uniform(gl, program, name) {
	return gl.getUniformLocation(program, name);
}
