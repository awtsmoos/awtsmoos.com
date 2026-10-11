// B"H
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGrassFieldMesh } from '../src/core/geometry/grass/createGrassFieldMesh.js';
import {
	createMeadowGrassTints,
	MEADOW_GRASS_TINT_PALETTES
} from '../src/core/webgl/grass/meadowGrassTints.js';
import { resolveGrassShaderSources, sampleMeadowGust } from '../src/core/webgl/grass/MeadowGrassGlRenderer.js';
import { VS_SOURCE_GRASS } from '../src/core/webgl/shaders/grass/vertex.js';

test('meadow grass tints are deterministic per seed', () => {
	const field = createGrassFieldMesh({
		seed: 'tint-test',
		count: 200,
		bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
		heightAt: () => 0
	});
	const first = createMeadowGrassTints(field, { seed: 'tint-seed' });
	const second = createMeadowGrassTints(field, { seed: 'tint-seed' });
	assert.equal(first.length, field.instanceCount * 3);
	assert.deepEqual([...first], [...second]);
	const other = createMeadowGrassTints(field, { seed: 'different-seed' });
	assert.notDeepEqual([...first], [...other]);
});

test('meadow grass tints stay in a sane positive range', () => {
	const field = createGrassFieldMesh({
		seed: 'tint-range',
		count: 120,
		bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
		heightAt: () => 0
	});
	for (const palette of Object.keys(MEADOW_GRASS_TINT_PALETTES)) {
		const tints = createMeadowGrassTints(field, { seed: 'range-seed', palette });
		for (const value of tints) {
			assert.ok(value >= 0.05 && value <= 1.6, `tint ${value} out of range for ${palette}`);
		}
	}
});

test('unknown palette falls back to dream-meadow', () => {
	const field = createGrassFieldMesh({ seed: 'fb', count: 10, heightAt: () => 0 });
	const tints = createMeadowGrassTints(field, { seed: 's', palette: 'nope' });
	assert.equal(tints.length, field.instanceCount * 3);
});

test('grass tint shader edit is backward compatible', () => {
	assert.ok(VS_SOURCE_GRASS.includes('aInstanceTint'), 'tint attribute declared');
	assert.ok(VS_SOURCE_GRASS.includes('uTintStrength'), 'tint strength uniform declared');
	assert.ok(
		VS_SOURCE_GRASS.includes("mix(vec3(1.0), max(aInstanceTint, vec3(0.0)), clamp(uTintStrength, 0.0, 1.0))"),
		'tint gated by strength so legacy callers (strength 0) see identical color'
	);
});

test('grass shader sources resolve the toneMapping include', () => {
	const sources = resolveGrassShaderSources();
	assert.ok(!sources.fragment.includes('#include <toneMapping>'), 'include expanded');
	assert.ok(sources.fragment.includes('vec3 aces(vec3 x)'), 'ACES chunk present');
	assert.ok(sources.vertex.includes('aInstanceWindPhase'), 'wind phase attribute present');
});

test('meadow gust stays positive and varies', () => {
	const samples = [0, 1, 5, 10, 30, 90].map(sampleMeadowGust);
	for (const value of samples) {
		assert.ok(value >= 0.3 && value <= 2.2, `gust ${value} out of band`);
	}
	assert.ok(new Set(samples.map(v => v.toFixed(4))).size > 1, 'gust varies over time');
});
