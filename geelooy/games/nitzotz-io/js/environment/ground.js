// B"H
// Boruch Hashem
// Blessed is He
import { cmd } from '../renderList/command.js';

/**
 * The Awtsmoos reveals one navigable valley through named remote materials. Grass,
 * dirt, and stone retain the original geometry while Awtsmoos.com gains surface scale.
 */
export function groundCommands(commands, world, preset, budget) {
	const bounds = world.level.bounds;
	commands.push(cmd(
		'plane',
		[0, -24, 0],
		[bounds * 1.12, 1, bounds * 1.12],
		0,
		preset.ground,
		1,
		0.04,
		0,
		'grass'
	));
	addTerraces(commands, bounds, preset, budget.terraces);
	addTrafficLanes(commands, bounds, preset, budget.roads);
	addCurvedPath(commands, bounds, preset, budget.paths);
	commands.push(cmd(
		'ring',
		[0, -17.2, 0],
		[bounds, 1, bounds],
		0,
		preset.path,
		0.64,
		0.28,
		0,
		'stone'
	));
}

function addTerraces(commands, bounds, preset, count) {
	for (let index = 0; index < count; index += 1) {
		const scale = 0.76 - index * 0.14;
		commands.push(cmd(
			'disc',
			[(index % 2 ? -1 : 1) * bounds * 0.08, -22 + index * 1.45, 0],
			[bounds * scale, 1, bounds * scale * 0.78],
			index * 0.18,
			index % 2 ? preset.terrace : preset.ground,
			0.9,
			0.04,
			0,
			index % 2 ? 'dirt' : 'grass'
		));
	}
}

function addTrafficLanes(commands, bounds, preset, count) {
	const laneCount = Math.max(3, Math.floor(count / 2));
	for (let index = 0; index < laneCount; index += 1) {
		const centered = index - (laneCount - 1) / 2;
		const offset = centered * bounds * 0.18;
		commands.push(cmd(
			'cube',
			[offset, -17.4, 0],
			[18, 1, bounds],
			0,
			preset.road,
			0.76,
			0.04,
			0,
			'stone'
		));
		commands.push(cmd(
			'cube',
			[0, -17.2, offset],
			[bounds, 1, 18],
			0,
			preset.road,
			0.76,
			0.04,
			0,
			'stone'
		));
	}
}

function addCurvedPath(commands, bounds, preset, count) {
	for (let index = 0; index < count; index += 1) {
		const start = pathPoint(index / count, bounds, preset.pathCurve);
		const end = pathPoint((index + 1) / count, bounds, preset.pathCurve);
		const deltaX = end.x - start.x;
		const deltaZ = end.z - start.z;
		commands.push(cmd(
			'cube',
			[(start.x + end.x) * 0.5, -16.5, (start.z + end.z) * 0.5],
			[9, 0.7, Math.hypot(deltaX, deltaZ) * 0.54],
			Math.atan2(deltaX, deltaZ),
			preset.path,
			0.84,
			0.12,
			0,
			'dirt'
		));
	}
}

function pathPoint(progress, bounds, curve) {
	const x = (progress * 2 - 1) * bounds * 0.78;
	const z = Math.sin(progress * Math.PI * 2) * bounds * 0.14 * curve;
	return { x, z };
}
