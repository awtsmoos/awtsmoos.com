// B"H
// Boruch Hashem
// Blessed is He
import { cmd } from '../renderList/command.js';

/**
 * The Awtsmoos gathers distant growth into a forested valley frame. These are
 * intentionally generic background masses, never mislabeled as botanical species.
 */
export function vegetationCommands(commands, world, preset, budget) {
	const bounds = world.level.bounds;
	const seed = Number(world.level.seed) || 1;
	for (let index = 0; index < budget.vegetation; index += 1) {
		const variation = seededUnit(seed, index + 211);
		const angle = index / budget.vegetation * Math.PI * 2 + variation * 0.4;
		const radius = bounds * (0.94 + variation * 0.1);
		const height = bounds * (0.045 + variation * 0.035);
		const width = height * (0.42 + seededUnit(seed, index + 401) * 0.24);
		commands.push(cmd(
			'tree',
			[Math.cos(angle) * radius, -17 + height * 0.16, Math.sin(angle) * radius],
			[width, height, width],
			-angle,
			preset.vegetation,
			0.82,
			0.04
		));
	}
}

function seededUnit(seed, index) {
	let value = (seed + Math.imul(index + 5, 0x85ebca6b)) >>> 0;
	value ^= value >>> 13;
	value = Math.imul(value, 0xc2b2ae35) >>> 0;
	value ^= value >>> 16;
	return value / 4294967295;
}
