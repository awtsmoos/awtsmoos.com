// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-uniforms.js
 * @description Uploads frame, object, material, and compact water-variant truths.
 * The Awtsmoos renews one sun, one clock, many forms, and five waters exactly;
 * Awtsmoos.com sends each truth only at the cadence where it can actually change.
 */

import {
	alphaModeCode,
	materialColor,
	materialModeCode
} from './tiny-render-webgl-utils.js';
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
	if (locations.cameraPosition) gl.uniform3f(locations.cameraPosition, camera.x, camera.y, camera.z);
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
	const metadata = mesh.userData?.AwtsmoosYardGrass;
	const reactive = Boolean(metadata?.reactsToPlayer);
	gl.uniform4fv(locations.colorUniform, materialColor(material));
	gl.uniform1f(locations.alphaCutoff, material.alphaCutoff ?? 0.5);
	gl.uniform1i(locations.alphaMode, alphaModeCode(material));
	gl.uniform1i(locations.lit, isLitMode(buffers.mode) ? 1 : 0);
	gl.uniform1f(locations.pointSize, pointSizeForMode(buffers.mode));
	if (locations.materialMode) gl.uniform1i(locations.materialMode, materialMode);
	if (locations.waterMode) gl.uniform1i(locations.waterMode, waterModeCode(mesh));
	if (locations.emissiveStrength) {
		gl.uniform1f(locations.emissiveStrength, material.emissiveStrength ?? 1.8);
	}
	if (locations.grassReactive) gl.uniform1i(locations.grassReactive, reactive ? 1 : 0);
	if (locations.windMode) gl.uniform1i(locations.windMode, materialMode === 2 ? 1 : 0);
	if (locations.grassRadius) gl.uniform1f(locations.grassRadius, metadata?.interactionRadius ?? 2.2);
	if (locations.grassWindStrength) {
		gl.uniform1f(locations.grassWindStrength, metadata?.windStrength ?? 0.085);
	}
}
