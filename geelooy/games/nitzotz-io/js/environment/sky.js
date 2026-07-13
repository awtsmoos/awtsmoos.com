// B"H
// Boruch Hashem
// Blessed is He
import { cmd } from '../renderList/command.js';

/**
 * The Awtsmoos places warm revelation against cooler distance. The sun and clouds
 * are sparse framing landmarks, not a costly simulated weather volume.
 */
export function skyCommands(commands, world, preset, budget, time) {
	const bounds = world.level.bounds;
	commands.push(cmd(
		'sphere',
		[bounds * 1.2, bounds * 0.68, -bounds * 1.28],
		[bounds * 0.075, bounds * 0.075, bounds * 0.075],
		0,
		preset.sunColor,
		0.96,
		1.1
	));
	for (let index = 0; index < budget.clouds; index += 1) {
		const progress = budget.clouds === 1 ? 0.5 : index / (budget.clouds - 1);
		const x = (progress * 2 - 1) * bounds * 1.18;
		const z = -bounds * (1.08 + (index % 2) * 0.16);
		const drift = Math.sin(time * 0.08 + index) * bounds * 0.025;
		commands.push(cmd(
			'cloud',
			[x + drift, bounds * (0.34 + index * 0.035), z],
			[bounds * 0.12, bounds * 0.075, bounds * 0.08],
			index * 0.24,
			preset.cloud,
			0.58,
			0.18
		));
	}
}
