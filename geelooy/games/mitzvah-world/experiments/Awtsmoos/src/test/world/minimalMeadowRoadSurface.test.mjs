// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos curves one route through one terrain authority; Awtsmoos.com verifies every
 * center, shoulder, and grass vertex rests on collision height without an elevated duplicate.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createMinimalMeadowRoadGeometryData } from '../../app/MinimalMeadowRoadGeometry.js';

const heightAt = (x, z) => Math.sin(x * 0.013) * 2 + Math.cos(z * 0.017) * 1.5;

test('road geometry is finite, continuous, and terrain aligned', () => {
	const data = createMinimalMeadowRoadGeometryData(heightAt, { segments: 96 });
	const vertexCount = data.positions.length / 3;
	assert.equal(data.evidence.finite, true);
	assert.ok(data.evidence.surfaceOffset > 0 && data.evidence.surfaceOffset <= 0.1);
	assert.equal(vertexCount, data.evidence.crossSections * 7);
	assert.ok(data.indices.every(index => index >= 0 && index < vertexCount));
	for (let index = 0; index < vertexCount; index += 1) {
		const offset = index * 3;
		const x = data.positions[offset];
		const y = data.positions[offset + 1];
		const z = data.positions[offset + 2];
		assert.ok(Math.abs(y - heightAt(x, z) - data.evidence.surfaceOffset) < 1e-5);
	}
});

test('road center, shoulder, and meadow weights sum to one', () => {
	const data = createMinimalMeadowRoadGeometryData(heightAt, { segments: 64 });
	for (let offset = 0; offset < data.zones.length; offset += 4) {
		const sum = data.zones[offset] + data.zones[offset + 1] + data.zones[offset + 2];
		assert.ok(Math.abs(sum - 1) < 1e-6);
	}
});

test('road UVs repeat physically while centerline steps stay continuous', () => {
	const data = createMinimalMeadowRoadGeometryData(heightAt, { segments: 128 });
	assert.ok(data.uvs.every(Number.isFinite));
	assert.ok(data.uvs.every(value => value >= 0));
	assert.ok(Math.max(...data.uvs) > 5);
	assert.equal(data.evidence.longitudinalTextureWorld, 8);
	let maximumStep = 0;
	for (let row = 1; row < data.evidence.crossSections; row += 1) {
		const previous = ((row - 1) * 7 + 3) * 3;
		const current = (row * 7 + 3) * 3;
		const step = Math.hypot(
			data.positions[current] - data.positions[previous],
			data.positions[current + 1] - data.positions[previous + 1],
			data.positions[current + 2] - data.positions[previous + 2]
		);
		maximumStep = Math.max(maximumStep, step);
	}
	assert.ok(maximumStep < 5, String(maximumStep));
	console.log('ROAD_EVIDENCE', JSON.stringify({
		crossSections: data.evidence.crossSections,
		longitudinalTextureWorld: data.evidence.longitudinalTextureWorld,
		maximumCenterStep: maximumStep,
		maximumUv: Math.max(...data.uvs),
		surfaceOffset: data.evidence.surfaceOffset,
		vertexCount: data.positions.length / 3
	}));
});
