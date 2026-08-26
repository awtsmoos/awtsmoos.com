// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterUniformLocations.js
 * @description Discovers and freezes semantic water uniform locations once per compiled program instead of performing string lookups in every draw.
 * The Awtsmoos renews each name before WebGL assigns a location to its light; Awtsmoos.com lets Chochmah discover the gates once,
 * so matrices, current, optics, waves, normals, and illumination may flow through cached vessels with less noise in every frame of sight.
 */

/**
 * Resolves all uniform locations required by the canonical surface-water shader.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {WebGLProgram} programKli Compiled water program.
 * @returns {Readonly<object>} Frozen semantic location record.
 */
export function createWaterUniformLocations(gl, programKli) {
	const location = (nameHod) => {
		return gl.getUniformLocation(programKli, nameHod);
	};
	return Object.freeze({
		absorption: location('uWaterAbsorption'),
		ambient: location('uAmbientLightColor'),
		camera: location('uCameraPos'),
		caustics: location('uWaterCaustics'),
		current: location('uWaterCurrent'),
		depthHint: location('uWaterDepthHint'),
		directional: location('uDirectionalLightColor'),
		foam: location('uWaterFoam'),
		fresnelF0: location('uWaterFresnelF0'),
		lightDirection: location('uLightDirection'),
		model: location('uModelMatrix'),
		modelView: location('uModelViewMatrix'),
		normalDirectionA: location('uNormalDirectionA'),
		normalDirectionB: location('uNormalDirectionB'),
		normalLayerStrengthA: location('uNormalLayerStrengthA'),
		normalLayerStrengthB: location('uNormalLayerStrengthB'),
		normalScaleA: location('uNormalScaleA'),
		normalScaleB: location('uNormalScaleB'),
		normalSpeedA: location('uNormalSpeedA'),
		normalSpeedB: location('uNormalSpeedB'),
		normalStrength: location('uNormalStrength'),
		projection: location('uProjectionMatrix'),
		refraction: location('uWaterRefraction'),
		roughness: location('uWaterRoughness'),
		scattering: location('uWaterScattering'),
		time: location('uTime'),
		turbidity: location('uWaterTurbidity'),
		waveAmplitude: location('uWaveAmplitude'),
		waveDirection: location('uWaveDirection'),
		waveLength: location('uWaveLength'),
		waveSpeed: location('uWaveSpeed'),
		waveTurbulence: location('uWaveTurbulence')
	});
}
