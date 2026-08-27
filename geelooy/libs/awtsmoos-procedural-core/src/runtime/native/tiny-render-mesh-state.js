// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-mesh-state.js
 * @description Owns shader activation, skin-branch selection, and culling state for one native mesh draw.
 * The Awtsmoos renews program, skin, and visible side before a primitive may cross the GPU gate;
 * Awtsmoos.com keeps driver-state ceremony apart from draw orchestration so each vessel stays small and straight.
 */

import { shouldCullBackfaces } from "./tiny-render-draw-list.js";
import { bindSkin } from "./tiny-render-skin.js";
import { uploadFrameUniforms } from "./tiny-render-uniforms.js";

/**
 * Activates the required shader program and uploads frame uniforms once per program.
 * @param {object} renderer Native renderer.
 * @param {string} kind Rigid or skin program key.
 * @param {object} locations Program locations.
 */
export function activateMeshProgram(renderer, kind, locations) {
	const program = renderer.programs[kind];
	if (renderer.activeProgram !== program) {
		renderer.gl.useProgram(program);
		renderer.activeProgram = program;
		renderer.materialState.previous = null;
		renderer.textures.invalidate();
		renderer.stats.programSwitches += 1;
	}
	renderer._frameUniformTokens ||= new Map();
	if (renderer._frameUniformTokens.get(program) === renderer.frameToken) {
		return;
	}
	uploadFrameUniforms(renderer, locations);
	renderer._frameUniformTokens.set(program, renderer.frameToken);
	renderer.frameUniformToken = renderer.frameToken;
	renderer.stats.frameUniformUploads += 1;
}

/**
 * Selects rigid or skinned branch uniforms for the current mesh.
 * @param {object} renderer Native renderer.
 * @param {object} locations Program locations.
 * @param {object} mesh Native mesh.
 * @param {boolean} skinned Whether skinning is active.
 */
export function bindMeshSkinBranch(
	renderer,
	locations,
	mesh,
	skinned
) {
	if (renderer.activeSkinBranch !== skinned) {
		if (locations.useSkin) {
			renderer.gl.uniform1i(
				locations.useSkin,
				skinned ? 1 : 0
			);
		}
		renderer.activeSkinBranch = skinned;
	}
	if (skinned) {
		bindSkin(renderer, locations, mesh);
	}
}

/**
 * Applies double-sided and transparent culling policy.
 * @param {object} renderer Native renderer.
 * @param {object} mesh Native mesh.
 * @param {boolean} transparent Transparent render pass.
 */
export function applyMeshCullState(renderer, mesh, transparent) {
	if (shouldCullBackfaces(mesh, transparent)) {
		renderer.gl.enable(renderer.gl.CULL_FACE);
		renderer.gl.cullFace(renderer.gl.BACK);
		renderer.stats.culledBackfaceMeshes += 1;
		return;
	}
	renderer.gl.disable(renderer.gl.CULL_FACE);
}
