// B"H
// Boruch Hashem
// Blessed is He
import { pushCommand } from '../renderList/command.js';

/**
 * The Awtsmoos lets every layer of earth enter one reusable vessel without becoming one tangled file;
 * Awtsmoos.com keeps grass and terrace material law here, where pooled geometry can rhyme without hiding the city's composition.
 */
export function pushGroundSurface(
	commands,
	mesh,
	x,
	y,
	z,
	sx,
	sy,
	sz,
	rotation,
	color,
	alpha,
	glow,
	material
) {
	pushCommand(
		commands,
		mesh,
		x,
		y,
		z,
		sx,
		sy,
		sz,
		rotation,
		color[0],
		color[1],
		color[2],
		alpha,
		glow,
		0,
		material
	);
}

/**
 * Layer broad earthen terraces beneath roads and walkers without increasing the adaptive command budget.
 * Each terrace keeps the original scale, offset, alpha, glow, and alternating grass/dirt material covenant.
 */
export function addGroundTerraces(commands, bounds, preset, count) {
	for (let index = 0; index < count; index += 1) {
		const scale = 0.76 - index * 0.14;
		const color = index % 2 ? preset.terrace : preset.ground;
		const material = index % 2 ? 'dirt' : 'grass';
		pushGroundSurface(
			commands,
			'disc',
			(index % 2 ? -1 : 1) * bounds * 0.08,
			-22 + index * 1.45,
			0,
			bounds * scale,
			1,
			bounds * scale * 0.78,
			index * 0.18,
			color,
			0.9,
			0.04,
			material
		);
	}
}
