// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-locations.js
 * @description Names every vertex and uniform doorway, including six terrain layers.
 * The Awtsmoos gives each GPU declaration its exact place; Awtsmoos.com lets ecological
 * zones and many stacked textures enter one program without hidden dynamic lookup.
 */

import { TERRAIN_LAYER_COUNT } from './tiny-layered-texture-state.js';

export function rendererLocations(gl, program) {
	const attribute = name => gl.getAttribLocation(program, name);
	const uniform = name => gl.getUniformLocation(program, name);
	return {
		position: attribute('aPosition'),
		normal: attribute('aNormal'),
		color: attribute('aColor'),
		uv: attribute('aUv'),
		zone: attribute('aZone'),
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
		terrainLayers: terrainLayerLocations(uniform),
		materialMode: uniform('uMaterialMode'),
		emissiveStrength: uniform('uEmissiveStrength'),
		ambient: uniform('uAmbient'),
		sunDirection: uniform('uSunDirection'),
		sunColor: uniform('uSunColor'),
		cameraPosition: uniform('uCameraPosition'),
		fogColor: uniform('uFogColor'),
		fogNear: uniform('uFogNear'),
		fogFar: uniform('uFogFar'),
		exposure: uniform('uExposure'),
		grassReactive: uniform('uGrassReactive'),
		windMode: uniform('uWindMode'),
		interactor: uniform('uInteractor'),
		grassRadius: uniform('uGrassRadius'),
		grassWindStrength: uniform('uGrassWindStrength'),
		time: uniform('uTime'),
		jointMatrices: uniform('uJointMatrices[0]'),
		jointTexture: uniform('uJointTexture'),
		jointTextureHeight: uniform('uJointTextureHeight')
	};
}

function terrainLayerLocations(uniform) {
	return Array.from({ length: TERRAIN_LAYER_COUNT }, (_, index) => ({
		map: uniform(`uTerrainLayer${index}`),
		repeat: uniform(`uTerrainLayerRepeat${index}`),
		strength: uniform(`uTerrainLayerStrength${index}`),
		use: uniform(`uUseTerrainLayer${index}`)
	}));
}
