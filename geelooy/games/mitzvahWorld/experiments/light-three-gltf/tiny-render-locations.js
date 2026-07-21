// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-locations.js
 * @description Names vertex and uniform doorways for measured terrain and living water.
 * The Awtsmoos gives each GPU declaration its place; Awtsmoos.com lets ecological controls
 * and five water vessels enter one program without querying lawfully omitted uniforms.
 */

import { TERRAIN_LAYER_TARGET } from './tiny-terrain-layer-policy.js';

export function rendererLocations(gl, program, layerCount = TERRAIN_LAYER_TARGET) {
	const attribute = name => gl.getAttribLocation(program, name);
	const uniform = name => gl.getUniformLocation(program, name);
	return {
		position: attribute('aPosition'), normal: attribute('aNormal'),
		color: attribute('aColor'), uv: attribute('aUv'), zone: attribute('aZone'),
		joints: attribute('aJoints'), weights: attribute('aWeights'),
		mvp: uniform('uMvp'), model: uniform('uModel'), colorUniform: uniform('uColor'),
		alphaCutoff: uniform('uAlphaCutoff'), alphaMode: uniform('uAlphaMode'),
		lit: uniform('uLit'), pointSize: uniform('uPointSize'),
		map: uniform('uMap'), useMap: uniform('uUseMap'), mapRepeat: uniform('uMapRepeat'),
		mixMap: uniform('uMixMap'), useMixMap: uniform('uUseMixMap'),
		mixRepeat: uniform('uMixRepeat'), mixStrength: uniform('uMixStrength'),
		mixPatchScale: uniform('uMixPatchScale'), mixPatchSharpness: uniform('uMixPatchSharpness'),
		terrainLayers: terrainLayerLocations(uniform, layerCount),
		materialMode: uniform('uMaterialMode'), waterMode: uniform('uWaterMode'),
		emissiveStrength: uniform('uEmissiveStrength'), ambient: uniform('uAmbient'),
		sunDirection: uniform('uSunDirection'), sunColor: uniform('uSunColor'),
		cameraPosition: uniform('uCameraPosition'), fogColor: uniform('uFogColor'),
		fogNear: uniform('uFogNear'), fogFar: uniform('uFogFar'), exposure: uniform('uExposure'),
		grassReactive: uniform('uGrassReactive'), windMode: uniform('uWindMode'),
		interactor: uniform('uInteractor'), grassRadius: uniform('uGrassRadius'),
		grassWindStrength: uniform('uGrassWindStrength'), time: uniform('uTime'),
		jointMatrices: uniform('uJointMatrices[0]'), jointTexture: uniform('uJointTexture'),
		jointTextureHeight: uniform('uJointTextureHeight')
	};
}

function terrainLayerLocations(uniform, layerCount) {
	return Array.from({ length: Math.max(0, Math.floor(layerCount)) }, (_, index) => ({
		angle: uniform(`uTerrainLayerAngle${index}`),
		height: uniform(`uTerrainLayerHeight${index}`),
		map: uniform(`uTerrainLayer${index}`),
		repeat: uniform(`uTerrainLayerRepeat${index}`),
		slope: uniform(`uTerrainLayerSlope${index}`),
		strength: uniform(`uTerrainLayerStrength${index}`),
		use: uniform(`uUseTerrainLayer${index}`),
		wetness: uniform(`uTerrainLayerWetness${index}`),
		zones: uniform(`uTerrainLayerZones${index}`)
	}));
}
