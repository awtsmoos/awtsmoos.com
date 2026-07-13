// B"H
// Boruch Hashem
// Blessed is He
import { cmd } from '../renderList/command.js';

/**
 * The Awtsmoos clothes reflected light in moving water. These surfaces remain
 * visual-only and shallow, so they guide composition without changing navigation.
 */
export function waterCommands(commands, world, preset, budget, time) {
	const bounds = world.level.bounds;
	const shimmer = Math.sin(time * 1.35) * 0.45;
	const lakeX = bounds * 0.38;
	const lakeZ = -bounds * 0.3;
	commands.push(cmd(
		'disc',
		[lakeX, -16.8 + shimmer, lakeZ],
		[bounds * 0.2, 1, bounds * 0.14],
		0.28,
		preset.water,
		0.72,
		0.34
	));
	commands.push(cmd(
		'ring',
		[lakeX, -17.1, lakeZ],
		[bounds * 0.205, 1, bounds * 0.145],
		0.28,
		preset.shore,
		0.62,
		0.08
	));
	addStream(commands, bounds, preset, budget.water, time);
}

function addStream(commands, bounds, preset, count, time) {
	for (let index = 0; index < count; index += 1) {
		const start = streamPoint(index / count, bounds);
		const end = streamPoint((index + 1) / count, bounds);
		const deltaX = end.x - start.x;
		const deltaZ = end.z - start.z;
		const pulse = Math.sin(time * 1.8 + index * 0.9) * 0.32;
		commands.push(cmd(
			'cube',
			[(start.x + end.x) * 0.5, -16.7 + pulse, (start.z + end.z) * 0.5],
			[12 + preset.waterAmount * 7, 0.55, Math.hypot(deltaX, deltaZ) * 0.55],
			Math.atan2(deltaX, deltaZ),
			preset.water,
			0.66,
			0.28
		));
	}
}

function streamPoint(progress, bounds) {
	return {
		x: bounds * (0.48 - progress * 1.05),
		z: bounds * (-0.3 + progress * 0.62) + Math.sin(progress * Math.PI * 2) * bounds * 0.08
	};
}
