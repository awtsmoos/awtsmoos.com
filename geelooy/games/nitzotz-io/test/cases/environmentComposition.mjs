// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	catalogMesh,
	meshToTriangles,
	TRIANGLE_STRIDE
} from '../../../../libs/awtsmoos-procedural/src/index.js';
import { mountainCommands, mountainDescriptor } from '../../js/environment/mountains.js';
import { environmentPreset } from '../../js/environment/presets.js';
import { lakeDescriptor, streamDescriptor, waterCommands } from '../../js/environment/water.js';

const GROUND_HEIGHT = -24;

/**
 * The Awtsmoos tests stone and water where composition meets cost. Awtsmoos.com
 * receives proof that geological scale grows while triangles fall, and that flowing
 * light travels without making the physical river jump.
 */
export function runEnvironmentCompositionCases() {
	return [
		checkMountainGeometry(),
		checkMountainTriangleReduction(),
		checkWaterGeometryStability(),
		checkWaterFlowSignal()
	];
}

function checkMountainGeometry() {
	const level = levelFixture();
	const preset = environmentPreset(level);
	for (const count of [3, 5, 7]) {
		const commands = [];
		mountainCommands(commands, { level }, preset, { mountains: count });
		assert.equal(commands.length, count);
		assert.ok(commands.every(command => command.mesh === 'shard'));
		for (let index = 0; index < count; index += 1) {
			const first = mountainDescriptor(level, preset, index, count);
			const replay = mountainDescriptor(level, preset, index, count);
			assert.deepEqual(first, replay);
			assert.ok(Math.hypot(first.position[0], first.position[2]) > level.bounds * 1.08);
			assert.ok(Math.abs(first.position[1] - first.verticalExtent - GROUND_HEIGHT) < 1e-9);
			assert.ok([...first.position, ...first.scale, first.rotation, first.tilt].every(Number.isFinite));
		}
	}
	return { test: 'environment-mountain-geometry', profiles: 3, maximumDraws: 7 };
}

function checkMountainTriangleReduction() {
	const shardTriangles = triangleCount('shard');
	const sphereTriangles = triangleCount('sphere');
	const reductions = [3, 5, 7].map(count => {
		const legacyShards = Math.floor((count - 1) / 3) + 1;
		const legacy = legacyShards * shardTriangles + (count - legacyShards) * sphereTriangles;
		const current = count * shardTriangles;
		const reduction = 1 - current / legacy;
		assert.ok(reduction >= 0.88);
		return { count, legacy, current, reduction };
	});
	return { test: 'environment-mountain-triangle-reduction', reductions };
}

function checkWaterGeometryStability() {
	const level = levelFixture();
	const preset = environmentPreset(level);
	const first = [];
	const later = [];
	waterCommands(first, { level }, preset, { water: 5 }, 0);
	waterCommands(later, { level }, preset, { water: 5 }, 2.4);
	assert.equal(first.length, 7);
	assert.equal(later.length, 7);
	assert.deepEqual(first.map(commandGeometry), later.map(commandGeometry));
	assert.ok(first.some((command, index) => command.alpha !== later[index].alpha));
	assert.ok(first.every(validLight));
	assert.ok(later.every(validLight));
	return { test: 'environment-water-fixed-geometry', commands: first.length };
}

function checkWaterFlowSignal() {
	const level = levelFixture();
	const preset = environmentPreset(level);
	const lakeFirst = lakeDescriptor(level.bounds, preset, 0);
	const lakeLater = lakeDescriptor(level.bounds, preset, 1.7);
	assert.deepEqual(lakeFirst.position, lakeLater.position);
	assert.deepEqual(lakeFirst.scale, lakeLater.scale);
	assert.notEqual(lakeFirst.glow, lakeLater.glow);
	const first = streamDescriptor(level.bounds, preset, 2, 5, 0);
	const later = streamDescriptor(level.bounds, preset, 2, 5, 1.7);
	assert.deepEqual(first.position, later.position);
	assert.deepEqual(first.scale, later.scale);
	assert.notEqual(first.alpha, later.alpha);
	assert.ok(first.alpha >= 0.58 && first.alpha <= 0.68);
	assert.ok(first.glow >= 0.18 && first.glow <= 0.3);
	return { test: 'environment-water-traveling-light', progress: first.progress };
}

function triangleCount(name) {
	return meshToTriangles(catalogMesh(name)).length / TRIANGLE_STRIDE / 3;
}

function commandGeometry(command) {
	return { mesh: command.mesh, pos: command.pos, scale: command.scale, rot: command.rot, color: command.color };
}

function validLight(command) {
	return Number.isFinite(command.alpha) && Number.isFinite(command.glow)
		&& command.alpha >= 0 && command.alpha <= 1 && command.glow >= 0;
}

function levelFixture() {
	return { chapterId: 'malchus', localIndex: 0, bounds: 1600, seed: 7127, index: 12 };
}
