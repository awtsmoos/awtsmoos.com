// B"H
import { hsl } from '../math.js';
import { cmd } from './command.js';

/**
 * The arena is a place, not a treadmill: one floor, crossed roads, sector halos,
 * and a bright boundary whose complete shape remains fixed throughout the round.
 */
export function terrainCommands(commands, world) {
	const level = world.level;
	commands.push(cmd('plane', [0, -24, 0], [level.bounds * 1.08, 1, level.bounds * 1.08], 0, hsl(level.hue, 52, 16), 1, 0.08));
	addRoads(commands, level);
	addSectors(commands, level);
	commands.push(cmd('ring', [0, -18, 0], [level.bounds, 1, level.bounds], 0, hsl(level.hue + 38, 88, 58), 0.68, 0.52));
}

function addRoads(commands, level) {
	for (let lane = -2; lane <= 2; lane += 1) {
		const offset = lane * level.bounds * 0.18;
		const color = hsl(level.hue + 20, 48, 27);
		commands.push(cmd('cube', [offset, -18, 0], [18, 1, level.bounds], 0, color, 0.62, 0.06));
		commands.push(cmd('cube', [0, -17, offset], [level.bounds, 1, 18], 0, color, 0.62, 0.06));
	}
}

function addSectors(commands, level) {
	for (let index = 0; index < 8; index += 1) {
		const angle = index / 8 * Math.PI * 2;
		const radius = level.bounds * 0.48;
		commands.push(cmd(
			'disc',
			[Math.cos(angle) * radius, -20, Math.sin(angle) * radius],
			[level.bounds * 0.16, 1, level.bounds * 0.16],
			angle,
			hsl(level.hue + index * 22, 68, 25),
			0.34,
			0.08
		));
	}
}
