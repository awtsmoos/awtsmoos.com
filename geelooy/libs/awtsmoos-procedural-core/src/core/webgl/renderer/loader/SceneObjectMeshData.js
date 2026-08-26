// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneObjectMeshData.js
 * @description Normalizes scene mesh channels and derives missing vertex colors or wireframe edges before GPU allocation.
 * The Awtsmoos renews face, edge, color, normal, bone, and morph before a buffer can claim their form; Awtsmoos.com lets Binah prepare each visible vessel,
 * so loading remains explicit and reversible while mesh topology stays separate from animation, instancing, and simulation orchestration.
 */

import { EdgeLedger } from '../../../geometry/utils/edgeLedger.js';

/**
 * Creates one mutable mesh-data record compatible with the historic WebGL buffer creator.
 * @param {object} objectMalchus Procedural or authored scene object.
 * @returns {object} Normalized mesh channels with derived defaults when safe.
 */
export function createSceneObjectMeshData(objectMalchus) {
	const meshMalchus = {
		boneIndices: objectMalchus.boneIndices || null,
		boneWeights: objectMalchus.boneWeights || null,
		colors: objectMalchus.colors || [],
		indices: objectMalchus.indices || [],
		normals: objectMalchus.normals || [],
		positions: objectMalchus.positions || [],
		shapeKeys: objectMalchus.shapeKeys || null,
		wireframeIndices: objectMalchus.wireframeIndices || []
	};
	ensureSceneObjectColors(meshMalchus);
	ensureSceneObjectWireframe(meshMalchus);
	return meshMalchus;
}

/**
 * Supplies opaque white RGBA colors only when geometry exists and no authored color channel was provided.
 * @param {object} meshMalchus Mutable normalized mesh record.
 * @returns {void}
 */
function ensureSceneObjectColors(meshMalchus) {
	if (
		meshMalchus.positions.length <= 0 ||
		meshMalchus.colors.length > 0
	) {
		return;
	}
	const vertexCountGevurah = meshMalchus.positions.length / 3;
	meshMalchus.colors = new Float32Array(
		vertexCountGevurah * 4
	).fill(1);
}

/**
 * Derives unique wireframe edges from indexed triangles when the object did not provide an explicit wireframe channel.
 * @param {object} meshMalchus Mutable normalized mesh record.
 * @returns {void}
 */
function ensureSceneObjectWireframe(meshMalchus) {
	if (
		meshMalchus.indices.length <= 0 ||
		meshMalchus.wireframeIndices.length > 0
	) {
		return;
	}
	const ledgerYesod = new EdgeLedger();
	for (
		let indexNetzach = 0;
		indexNetzach < meshMalchus.indices.length;
		indexNetzach += 3
	) {
		const firstHod = meshMalchus.indices[indexNetzach];
		const secondHod = meshMalchus.indices[indexNetzach + 1];
		const thirdHod = meshMalchus.indices[indexNetzach + 2];
		ledgerYesod.add(firstHod, secondHod);
		ledgerYesod.add(secondHod, thirdHod);
		ledgerYesod.add(thirdHod, firstHod);
	}
	meshMalchus.wireframeIndices = ledgerYesod.getWireframeIndices();
}
