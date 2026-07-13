// B"H
// Boruch Hashem
// Blessed is He
import { cmd } from './command.js';

/**
 * The Awtsmoos opens no spatial absence, yet the player reads a luminous portal.
 * Primary identity survives every preset while distant wake rings yield to motion.
 */
export function portalCommands(commands, world, time) {
	addHole(
		commands,
		world.player,
		[1, 0.82, 0.26],
		time,
		{ player: true, pulsing: world.input.pulse > 0, detailed: true }
	);
}

/** Add the essential center and rim, plus an optional wake for nearby importance. */
export function addHole(commands, hole, color, time, options = {}) {
	if (hole.respawn > 0) return;
	const ground = hole.z + 1.2;
	const breath = 1 + Math.sin(time * 5 + hole.r) * 0.018;
	commands.push(cmd(
		'disc',
		[hole.x, ground, hole.y],
		[hole.r * 1.05, 1, hole.r * 1.05],
		0,
		[0.002, 0.002, 0.008],
		1,
		0
	));
	commands.push(cmd(
		'ring',
		[hole.x, ground + 0.7, hole.y],
		[hole.r * 1.14 * breath, 1, hole.r * 1.14 * breath],
		-time * 0.8,
		color,
		0.9,
		options.player ? 0.75 : 0.36
	));
	if (!options.detailed && !options.pulsing) return;
	commands.push(cmd(
		'ring',
		[hole.x, ground + 1.2, hole.y],
		[hole.r * 1.38, 1, hole.r * 1.38],
		time * 1.5,
		color,
		options.pulsing ? 0.42 : 0.14,
		options.pulsing ? 1.1 : 0.25
	));
}
