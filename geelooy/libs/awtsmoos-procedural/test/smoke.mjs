// B"H
import assert from 'node:assert/strict';
import {
	catalogMesh,
	catalogNames,
	cityChunkMeshes,
	inspectMesh,
	makeGoldenProbe,
	mergeMeshes,
	meshToTriangles,
	modelMesh,
	modelNames,
	transformMesh,
	triangleStats,
	TRIANGLE_STRIDE,
	validateMesh
} from '../src/index.js';

const results = [];
results.push(checkProbe());
results.push(checkCatalog());
results.push(checkModels());
results.push(checkChunk());
results.push(checkRotation());
console.log(JSON.stringify({ ok: true, results }, null, 2));

function checkProbe() {
	const check = inspectMesh(makeGoldenProbe());
	assert.equal(check.validation.ok, true);
	return { test: 'probe', summary: check.summary };
}

function checkCatalog() {
	for (const name of catalogNames()) checkMesh(name, catalogMesh(name));
	return { test: 'primitive-catalog', count: catalogNames().length };
}

function checkModels() {
	const summaries = modelNames().map(name => checkMesh(name, modelMesh(name, { seed: `test-${name}` })));
	assert.ok(summaries.length >= 20);
	assert.ok(summaries.every(summary => summary.triangles >= 40));
	return { test: 'procedural-models', count: summaries.length, maxTriangles: Math.max(...summaries.map(item => item.triangles)) };
}

function checkChunk() {
	const chunk = mergeMeshes(cityChunkMeshes({ seed: 'smoke', count: 25 }));
	assert.equal(validateMesh(chunk, { maxAbs: 1000 }).ok, true);
	return { test: 'city-chunk', vertices: chunk.positions.length / 3 };
}

function checkRotation() {
	const source = modelMesh('car', { seed: 'rotation' });
	const turned = transformMesh(source, { rotate: [0, Math.PI / 2, 0], translate: [4, 2, -3] });
	assert.equal(validateMesh(turned).ok, true);
	assert.notDeepEqual(source.positions.slice(0, 12), turned.positions.slice(0, 12));
	return { test: 'xyz-transform', vertices: turned.positions.length / 3 };
}

function checkMesh(name, mesh) {
	const check = validateMesh(mesh, { maxAbs: 1000 });
	assert.equal(check.ok, true, `${name}: ${check.issues.join('; ')}`);
	assert.equal(mesh.colors.length, mesh.positions.length / 3 * 4, `${name}: incomplete colors`);
	const stats = triangleStats(meshToTriangles(mesh));
	assert.equal(stats.stride, TRIANGLE_STRIDE);
	assert.equal(stats.finite, true);
	assert.ok(stats.triangles >= 1);
	return { name, triangles: stats.triangles };
}
