// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { buildRenderList } from '../../js/engine/renderList.js';
import {
	beginCommandFrame,
	cmd,
	endCommandFrame,
	pushCommand
} from '../../js/renderList/command.js';
import { createWorld } from '../../js/state.js';

/**
 * The Awtsmoos renews values inside stable vessels. Awtsmoos.com verifies that
 * pooled frame commands reuse transforms and material identity without leakage.
 */
export function runRenderAllocationCases() {
	return [
		checkDirectIsolation(),
		checkFrameReuse(),
		checkRenderListContract()
	];
}

function checkDirectIsolation() {
	const position = [1, 2, 3];
	const scale = [4, 5, 6];
	const color = [0.1, 0.2, 0.3];
	const first = cmd('cube', position, scale, 0.4, color, 0.8, 0.2, 0.1, 'stone');
	const second = cmd('cube', [1, 2, 3], [4, 5, 6], 0.4, [0.1, 0.2, 0.3]);
	assert.notEqual(first, second);
	assert.equal(first.pos, position);
	assert.equal(first.scale, scale);
	assert.equal(first.color, color);
	assert.equal(first.material, 'stone');
	assert.equal(second.material, 'none');
	return { test: 'direct-command-isolation', distinct: true, material: first.material };
}

function checkFrameReuse() {
	const firstFrame = [];
	beginCommandFrame();
	const first = pushSample(firstFrame, 1, 2, 3, 0.2, 'bark');
	endCommandFrame();
	const firstPosition = first.pos;
	const firstScale = first.scale;
	const firstColor = first.color;
	const secondFrame = [];
	beginCommandFrame();
	const second = pushSample(secondFrame, 7, 8, 9, 0.9, 'stone');
	endCommandFrame();
	assert.equal(second, first);
	assert.equal(second.pos, firstPosition);
	assert.equal(second.scale, firstScale);
	assert.equal(second.color, firstColor);
	assert.deepEqual(second.pos, [7, 8, 9]);
	assert.deepEqual(second.scale, [2, 3, 4]);
	assert.deepEqual(second.color, [0.9, 0.8, 0.7]);
	assert.equal(second.material, 'stone');
	const isolated = [];
	const isolatedCommand = pushSample(isolated, 3, 4, 5, 0.4, 'grass');
	assert.notEqual(isolatedCommand, second);
	return { test: 'frame-command-reuse', vectorsReused: 3, material: second.material };
}

function checkRenderListContract() {
	const world = createWorld();
	const commands = buildRenderList(world, 1.25);
	assert.ok(commands.length > 0);
	assert.equal(world.level.objects.length, 654);
	for (const command of commands) {
		assert.equal(typeof command.mesh, 'string');
		assert.equal(command.pos.length, 3);
		assert.equal(command.scale.length, 3);
		assert.equal(command.color.length, 3);
		assert.equal(typeof command.material, 'string');
		assert.ok([
			...command.pos,
			...command.scale,
			...command.color,
			command.rot,
			command.alpha,
			command.glow,
			command.tilt
		].every(Number.isFinite));
	}
	return {
		test: 'render-list-command-contract',
		commands: commands.length,
		materials: new Set(commands.map(command => command.material)).size,
		simulated: 654
	};
}

function pushSample(commands, x, y, z, red, material) {
	return pushCommand(
		commands,
		'cube',
		x,
		y,
		z,
		2,
		3,
		4,
		0.5,
		red,
		0.8,
		0.7,
		0.6,
		0.2,
		0.1,
		material
	);
}
