//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tiny-render-uniforms.js
 * @description Uploads frame, object, material, rooted vegetation, and physical water truths.
 * The Awtsmoos renews one sun, one clock, many forms, flowing waters, and living blades exactly;
 * Awtsmoos.com sends each finite truth only where the existing bounded GPU program can reveal it.
 */

import {
	alphaModeCode,
	materialColor,
	materialModeCode
} from './tiny-render-webgl-utils.js';
import {
	uploadWaterPhysicalUniforms
} from './tiny-water-physical-uniforms.js';
import { waterModeCode } from './tiny-water-material-mode.js';
import {
	isLitMode,
	pointSizeForMode
} from './tiny-render-draw-list.js';

export function uploadFrameUniforms(renderer, locations) {
	const gl = renderer.gl;
	const environment = renderer.environment;
	const camera = renderer.frameCameraPosition;
	if (locations.ambient) gl.uniform3fv(locations.ambient, environment.ambient);
	if (locations.sunDirection) gl.uniform3fv(locations.sunDirection, environment.sunDirection);
	if (locations.sunColor) gl.uniform3fv(locations.sunColor, environment.sunColor);
	if (locations.cameraPosition) {
		gl.uniform3f(locations.cameraPosition, camera.x, camera.y, camera.z);
	}
	if (locations.fogColor) gl.uniform3fv(locations.fogColor, environment.fogColor);
	if (locations.fogNear) gl.uniform1f(locations.fogNear, environment.fogNear);
	if (locations.fogFar) gl.uniform1f(locations.fogFar, environment.fogFar);
	if (locations.exposure) gl.uniform1f(locations.exposure, environment.exposure);
	if (locations.interactor) {
		gl.uniform3f(locations.interactor, renderer.interactor.x, renderer.interactor.y, renderer.interactor.z);
	}
	if (locations.time) gl.uniform1f(locations.time, renderer.timeSeconds);
}

export function uploadObjectUniforms(renderer, locations, model, mvp) {
	renderer.gl.uniformMatrix4fv(locations.mvp, false, mvp);
	renderer.gl.uniformMatrix4fv(locations.model, false, model);
}

export function uploadMaterialUniforms(renderer, locations, mesh, buffers) {
	const gl = renderer.gl;
	const material = mesh.material || {};
	const materialMode = materialModeCode(mesh);
	const waterMode = waterModeCode(mesh);
	const grass = mesh.userData?.AwtsmoosYardGrass || {};
	const reactive = grass.reactsToPlayer === true;
	const windMode = materialMode === 2;
	gl.uniform4fv(locations.colorUniform, materialColor(material));
	gl.uniform1f(locations.alphaCutoff, material.alphaCutoff ?? 0.5);
	gl.uniform1i(locations.alphaMode, alphaModeCode(material));
	gl.uniform1i(locations.lit, isLitMode(buffers.mode) ? 1 : 0);
	gl.uniform1f(locations.pointSize, pointSizeForMode(buffers.mode));
	if (locations.materialMode) gl.uniform1i(locations.materialMode, materialMode);
	if (locations.waterMode) gl.uniform1i(locations.waterMode, waterMode);
	if (materialMode === 1) {
		uploadWaterPhysicalUniforms(gl, locations, material, waterMode);
	}
	if (locations.emissiveStrength) {
		gl.uniform1f(locations.emissiveStrength, material.emissiveStrength ?? 1.8);
	}
	uploadVegetationUniforms(gl, locations, grass, reactive, windMode);
}

function uploadVegetationUniforms(gl, locations, grass, reactive, windMode) {
	const defaultStrength = windMode ? 0.055 : 0;
	if (locations.grassReactive) gl.uniform1i(locations.grassReactive, reactive ? 1 : 0);
	if (locations.windMode) gl.uniform1i(locations.windMode, windMode ? 1 : 0);
	if (locations.grassRadius) gl.uniform1f(locations.grassRadius, grass.interactionRadius ?? 2.2);
	if (locations.grassWindStrength) {
		gl.uniform1f(locations.grassWindStrength, grass.windStrength ?? defaultStrength);
	}
	if (locations.grassWindDirection) {
		gl.uniform2f(
			locations.grassWindDirection,
			grass.windDirectionX ?? 0.72,
			grass.windDirectionZ ?? 0.69
		);
	}
	if (locations.grassGust) gl.uniform1f(locations.grassGust, grass.windGust ?? 0.5);
	if (locations.grassFlutter) gl.uniform1f(locations.grassFlutter, grass.windFlutter ?? 0);
	if (locations.grassWetness) gl.uniform1f(locations.grassWetness, grass.wetness ?? 0);
	if (locations.grassReaction) gl.uniform1f(locations.grassReaction, reactive ? grass.playerReaction ?? 0 : 0);
}
