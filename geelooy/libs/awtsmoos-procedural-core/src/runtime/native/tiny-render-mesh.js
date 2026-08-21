// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-mesh.js
 * @description Coordinates one native mesh draw while program, cull, skin, matrix, and accounting laws live elsewhere.
 * The Awtsmoos renews each mesh as object, material, skin, and light meet in one ray;
 * Awtsmoos.com keeps this coordinator slender so every lower WebGL law has its own revealed way.
 */

import {
	issueMeshDraw,
	multiplyRenderMatrices,
	recordMeshDraw
} from "./tiny-render-mesh-draw.js";
import {
	activateMeshProgram,
	applyMeshCullState,
	bindMeshSkinBranch
} from "./tiny-render-mesh-state.js";
import {
	uploadMaterialUniforms,
	uploadObjectUniforms
} from "./tiny-render-uniforms.js";

/**
 * Draws one native mesh in the current opaque or transparent pass.
 * @param {object} renderer Native renderer.
 * @param {object} mesh Native mesh.
 * @param {Float32Array} projectionView Frame projection-view matrix.
 * @param {boolean} transparent Whether this is the transparent pass.
 */
export function drawRenderMesh(
	renderer,
	mesh,
	projectionView,
	transparent
) {
	const resource = renderer.buffers.forMesh(mesh);
	if (!resource) return;
	const skinned = Boolean(
		mesh.isSkinnedMesh
		&& mesh.skeleton
		&& resource.attributes.joints
		&& resource.attributes.weights
	);
	const kind = skinned
		? "skin"
		: "rigid";
	const locations = renderer.loc[kind];
	const model = mesh.matrixWorld || renderer.identityMatrix;
	applyMeshCullState(renderer, mesh, transparent);
	activateMeshProgram(renderer, kind, locations);
	renderer.buffers.bindMesh(
		resource,
		locations,
		skinned
	);
	bindMeshSkinBranch(
		renderer,
		locations,
		mesh,
		skinned
	);
	renderer._objectMvpMatrix ||= new Float32Array(16);
	multiplyRenderMatrices(
		renderer._objectMvpMatrix,
		projectionView,
		model
	);
	uploadObjectUniforms(
		renderer,
		locations,
		model,
		renderer._objectMvpMatrix
	);
	if (renderer.materialState.needsUpload(mesh, resource)) {
		uploadMaterialUniforms(
			renderer,
			locations,
			mesh,
			resource
		);
	}
	renderer.textures.bind(
		locations,
		mesh.material,
		renderer.stats
	);
	issueMeshDraw(renderer, resource);
	recordMeshDraw(
		renderer,
		mesh,
		resource,
		skinned,
		transparent
	);
}
