// B"H
import {
	alphaModeCode,
	materialColor
} from './tiny-render-webgl-utils.js';
import {
	isLitMode,
	pointSizeForMode
} from './tiny-render-draw-list.js';

/** Uploads common material and living-grass state for one draw. */
export function uploadCommonUniforms(renderer, locations, mesh, buffers, model, mvp) {
	const gl = renderer.gl;
	gl.uniformMatrix4fv(locations.mvp, false, mvp);
	gl.uniformMatrix4fv(locations.model, false, model);
	gl.uniform4fv(locations.colorUniform, materialColor(mesh.material));
	gl.uniform1f(locations.alphaCutoff, mesh.material?.alphaCutoff ?? 0.5);
	gl.uniform1i(locations.alphaMode, alphaModeCode(mesh.material));
	gl.uniform1i(locations.lit, isLitMode(buffers.mode) ? 1 : 0);
	gl.uniform1f(locations.pointSize, pointSizeForMode(buffers.mode));
	uploadGrassUniforms(renderer, locations, mesh);
}

function uploadGrassUniforms(renderer, locations, mesh) {
	const gl = renderer.gl;
	const metadata = mesh.userData?.AwtsmoosYardGrass;
	const reactive = !!metadata?.reactsToPlayer;
	if (!locations.grassReactive) return;
	gl.uniform1i(locations.grassReactive, reactive ? 1 : 0);
	if (reactive) renderer.stats.reactiveGrassMeshes += 1;
	if (locations.interactor) {
		gl.uniform3f(
			locations.interactor,
			renderer.interactor.x,
			renderer.interactor.y,
			renderer.interactor.z
		);
	}
	if (locations.grassRadius) {
		gl.uniform1f(locations.grassRadius, metadata?.interactionRadius ?? 2.2);
	}
	if (locations.grassWindStrength) {
		gl.uniform1f(locations.grassWindStrength, metadata?.windStrength ?? 0.085);
	}
	if (locations.time) {
		gl.uniform1f(locations.time, renderer.timeSeconds);
	}
}
