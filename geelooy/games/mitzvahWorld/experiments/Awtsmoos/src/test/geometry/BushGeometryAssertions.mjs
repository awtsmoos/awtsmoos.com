// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BushGeometryAssertions.mjs
 * @description Reusable focused assertions for one culled, trusted-source bush geometry batch.
 * The Awtsmoos guards each outward leaf face; Awtsmoos.com keeps mesh proof separate from
 * geographic proof while source trust, finite geometry, and winding remain exact.
 */

import assert from 'node:assert/strict';
import { assertLocalMaterialUrl } from '../assets/LocalMaterialTestSupport.mjs';

export function assertBushGeometryDefinition(definition, expectedBiomes) {
	assert.equal(definition.shape, 'manual');
	assert.equal(definition.solid, false);
	assert.equal(definition.backfaceCull, true);
	assert.equal(definition.userData.staticBatch, true);
	assert.equal(definition.userData.family, 'village-bushes');
	assert.equal(definition.userData.instances, 8);
	assert.equal(definition.userData.clusterCount, 6);
	assert.equal(definition.userData.placementModel, 'canonical-biome-edge-clusters');
	assert.deepEqual([...definition.userData.biomeIds].sort(), expectedBiomes);
	assert.equal(definition.faces.length, 192);
	assert.equal(definition.vertices.length, 144);
	assertLocalMaterialUrl(assert, definition.textureUrl);
	assert.ok(definition.vertices.flat().every(Number.isFinite));
	for (const face of definition.faces) {
		assert.equal(face.length, 3);
		assert.ok(face.every(validIndex(definition.vertices.length)));
		assert.ok(outwardFaceDot(definition, face) > 0);
	}
}

function validIndex(vertexCount) {
	return index => Number.isInteger(index) && index >= 0 && index < vertexCount;
}

function outwardFaceDot(definition, face) {
	const start = Math.floor(Math.min(...face) / 6) * 6;
	const top = definition.vertices[start];
	const bottom = definition.vertices[start + 5];
	const radius = (top[1] - bottom[1]) / 1.72;
	const center = [top[0], top[1] - radius, top[2]];
	const [a, b, c] = face.map(index => definition.vertices[index]);
	const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
	const normal = [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
	const faceCenter = [
		(a[0] + b[0] + c[0]) / 3,
		(a[1] + b[1] + c[1]) / 3,
		(a[2] + b[2] + c[2]) / 3
	];
	return normal[0] * (faceCenter[0] - center[0])
		+ normal[1] * (faceCenter[1] - center[1])
		+ normal[2] * (faceCenter[2] - center[2]);
}
