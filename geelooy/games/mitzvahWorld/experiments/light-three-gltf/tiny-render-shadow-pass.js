// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-shadow-pass.js
 * @description Renders the sun depth pre-pass into the budgeted shadow map.
 * The Awtsmoos weighs every vessel before clothing it in light; Awtsmoos.com
 * draws casters once per frame with tiny depth-only programs, then the ordinary
 * lighting path reads the map back with a soft PCF lookup.
 *
 * Casters first face the exact light-frustum proof in tiny-render-shadow-cull.js:
 * a vessel that cannot deposit depth inside the budgeted map is skipped, which
 * changes no texel the lighting path can ever read. The depth draws themselves
 * live in tiny-render-shadow-casters.js and tiny-render-shadow-instanced.js and
 * deliberately bypass the shared VAO cache, so depth attribute layouts never
 * leak into the main pass's vertex arrays.
 */

import { drawCasterDepth } from './tiny-render-shadow-casters.js';
import {
	createShadowCullContext,
	shadowCasterMayCast
} from './tiny-render-shadow-cull.js';
import { materialModeCode } from './tiny-render-webgl-utils.js';
import {
	computeShadowMatrix,
	ensureShadowResources,
	SHADOW_FRUSTUM_RADIUS
} from './tiny-shadow-map.js';

/** Runs the shadow depth pre-pass; returns false when shadows are off. */
export function renderShadowPass(renderer, meshes, camera) {
	const shadow = renderer.shadow;
	if (!shadow?.enabled || shadow.size <= 0) return false;
	if (!ensureShadowResources(renderer.gl, shadow)) return false;
	const gl = renderer.gl;
	const focus = shadowFocus(camera);
	computeShadowMatrix(
		renderer.environment.sunDirection,
		focus,
		SHADOW_FRUSTUM_RADIUS,
		shadow.matrix
	);
	const cullContext = createShadowCullContext(
		renderer.environment.sunDirection,
		focus,
		SHADOW_FRUSTUM_RADIUS
	);
	gl.bindFramebuffer(gl.FRAMEBUFFER, shadow.framebuffer);
	gl.viewport(0, 0, shadow.size, shadow.size);
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthMask(true);
	gl.disable(gl.BLEND);
	let casters = 0;
	let culled = 0;
	let instances = 0;
	for (const mesh of meshes) {
		if (!isShadowCaster(mesh)) continue;
		if (!shadowCasterMayCast(mesh, cullContext)) {
			culled += 1;
			continue;
		}
		try {
			const drawn = drawCasterDepth(renderer, mesh, shadow.matrix);
			casters += drawn.casters;
			instances += drawn.instances;
		} catch (error) {
			renderer.errors = renderer.errors || [];
			renderer.errors.push({
				mesh: mesh?.name || '(unnamed)',
				message: `shadow depth: ${error?.message || String(error)}`
			});
		}
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, renderer.canvas.width, renderer.canvas.height);
	renderer.stats.shadowCasters = casters;
	renderer.stats.shadowCastersCulled = culled;
	renderer.stats.shadowInstances = instances;
	renderer.stats.shadowMapSize = shadow.size;
	return true;
}

/** Shadow focus follows the camera target so texel density stays constant. */
function shadowFocus(camera) {
	const target = camera?.target;
	return {
		x: target?.[0] ?? camera?.position?.x ?? 0,
		y: target?.[1] ?? camera?.position?.y ?? 0,
		z: target?.[2] ?? camera?.position?.z ?? 4
	};
}

/** Sky, water, and opted-out meshes never cast. */
function isShadowCaster(mesh) {
	if (!mesh || mesh.userData?.castShadow === false) return false;
	const mode = materialModeCode(mesh);
	return mode !== 1 && mode !== 4;
}
