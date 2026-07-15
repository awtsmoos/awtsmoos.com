// B"H
import {
	alphaModeCode,
	materialColor,
	materialModeCode
} from './tiny-render-webgl-utils.js';
import {
	isLitMode,
	pointSizeForMode
} from './tiny-render-draw-list.js';

/** Uploads material, golden-hour environment, water, and living foliage state for one draw. */
export function uploadCommonUniforms(renderer, locations, mesh, buffers, model, mvp) {
	const gl = renderer.gl;
	const materialMode = materialModeCode(mesh);
	gl.uniformMatrix4fv(locations.mvp, false, mvp);
	gl.uniformMatrix4fv(locations.model, false, model);
	gl.uniform4fv(locations.colorUniform, materialColor(mesh.material));
	gl.uniform1f(locations.alphaCutoff, mesh.material?.alphaCutoff ?? 0.5);
	gl.uniform1i(locations.alphaMode, alphaModeCode(mesh.material));
	gl.uniform1i(locations.lit, isLitMode(buffers.mode) ? 1 : 0);
	gl.uniform1f(locations.pointSize, pointSizeForMode(buffers.mode));
	if (locations.materialMode) gl.uniform1i(locations.materialMode, materialMode);
	if (locations.emissiveStrength) gl.uniform1f(locations.emissiveStrength, mesh.material?.emissiveStrength ?? 1.8);
	uploadEnvironmentUniforms(renderer, locations);
	uploadLivingUniforms(renderer, locations, mesh, materialMode);
}

function uploadEnvironmentUniforms(renderer, locations) {
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
}

function uploadLivingUniforms(renderer, locations, mesh, materialMode) {
	const gl = renderer.gl;
	const metadata = mesh.userData?.AwtsmoosYardGrass;
	const reactive = !!metadata?.reactsToPlayer;
	if (locations.grassReactive) gl.uniform1i(locations.grassReactive, reactive ? 1 : 0);
	if (locations.windMode) gl.uniform1i(locations.windMode, materialMode === 2 ? 1 : 0);
	if (reactive) renderer.stats.reactiveGrassMeshes += 1;
	if (locations.interactor) gl.uniform3f(locations.interactor, renderer.interactor.x, renderer.interactor.y, renderer.interactor.z);
	if (locations.grassRadius) gl.uniform1f(locations.grassRadius, metadata?.interactionRadius ?? 2.2);
	if (locations.grassWindStrength) gl.uniform1f(locations.grassWindStrength, metadata?.windStrength ?? 0.085);
	if (locations.time) gl.uniform1f(locations.time, renderer.timeSeconds);
}
