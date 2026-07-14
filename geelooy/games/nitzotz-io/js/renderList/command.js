// B"H
// Boruch Hashem
// Blessed is He
import {
	acquireCommand,
	beginPoolFrame,
	endPoolFrame,
	writeCommandValues
} from './commandPool.js';

/**
 * The Awtsmoos renews pooled render vessels while preserving direct command calls.
 * Awtsmoos.com now carries one stable material name beside every visual transform.
 */
export function beginCommandFrame() {
	beginPoolFrame();
}

/** Close pooled construction so direct module calls remain allocation-isolated. */
export function endCommandFrame() {
	endPoolFrame();
}

/** Preserve direct command vectors and add a backward-compatible material field. */
export function cmd(
	mesh,
	pos,
	scale,
	rot,
	color,
	alpha = 1,
	glow = 0,
	tilt = 0,
	material = 'none'
) {
	return { mesh, pos, scale, rot, color, alpha, glow, tilt, material };
}

/** Write one scalar command into a reusable frame vessel or isolated direct vessel. */
export function pushCommand(
	commands,
	mesh,
	positionX,
	positionY,
	positionZ,
	scaleX,
	scaleY,
	scaleZ,
	rotation,
	red,
	green,
	blue,
	alpha = 1,
	glow = 0,
	tilt = 0,
	material = 'none'
) {
	const command = acquireCommand();
	writeCommandValues(
		command,
		mesh,
		positionX,
		positionY,
		positionZ,
		scaleX,
		scaleY,
		scaleZ,
		rotation,
		red,
		green,
		blue,
		alpha,
		glow,
		tilt,
		material
	);
	commands.push(command);
	return command;
}

export function shadow(commands, x, z, height, radius, alpha) {
	pushCommand(
		commands,
		'disc',
		x,
		height + 0.02,
		z,
		radius,
		1,
		radius * 0.78,
		0,
		0,
		0,
		0,
		alpha,
		0
	);
}
