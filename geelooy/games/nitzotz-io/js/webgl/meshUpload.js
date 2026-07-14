// B"H
// Boruch Hashem
// Blessed is He
import {
	catalogMesh,
	catalogNames,
	meshToTriangles,
	modelMesh,
	modelNames,
	TRIANGLE_STRIDE
} from '../../../../libs/awtsmoos-procedural/src/index.js';
import { MODEL_VARIANTS, modelVariantKey } from '../modelKey.js';
import { localMeshEntries } from '../procedural/localMeshes.js';

/**
 * Upload shared catalog meshes, deterministic models, and game-local composites
 * exactly once. Local stone, scroll, and walker silhouettes remain one draw each.
 */
export function uploadCatalog(gl) {
	const output = {};
	for (const name of catalogNames()) {
		output[name] = uploadMesh(gl, name, catalogMesh(name));
	}
	for (const name of modelNames()) {
		for (let variant = 0; variant < MODEL_VARIANTS; variant += 1) {
			const key = modelVariantKey(name, variant);
			output[key] = uploadMesh(
				gl,
				key,
				modelMesh(name, { seed: `nitzotz-${name}-${variant}` })
			);
		}
	}
	for (const [name, mesh] of Object.entries(localMeshEntries())) {
		output[name] = uploadMesh(gl, name, mesh);
	}
	output.cube ||= uploadMesh(gl, 'cube', catalogMesh('cube'));
	output.box = output.cube;
	return output;
}

function uploadMesh(gl, name, mesh) {
	const data = meshToTriangles(mesh);
	if (!data.length) throw new Error(`Empty procedural mesh: ${name}`);
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	return {
		buffer,
		count: data.length / TRIANGLE_STRIDE,
		name,
		stride: TRIANGLE_STRIDE
	};
}
