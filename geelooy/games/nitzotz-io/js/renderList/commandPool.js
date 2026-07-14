// B"H
// Boruch Hashem
// Blessed is He

const commandPool = [];
let commandCursor = 0;
let frameActive = false;

/**
 * The Awtsmoos renews command values inside stable vessels. Awtsmoos.com keeps
 * material identity reusable without creating temporary vectors in the hot path.
 */
export function beginPoolFrame() {
	commandCursor = 0;
	frameActive = true;
}

/** Close pooled construction so direct command calls stay isolated. */
export function endPoolFrame() {
	frameActive = false;
}

/** Acquire a reusable command during a frame or an isolated command outside one. */
export function acquireCommand() {
	if (!frameActive) return emptyCommand();
	const command = commandPool[commandCursor] || emptyCommand();
	commandPool[commandCursor] = command;
	commandCursor += 1;
	return command;
}

/** Replace every scalar and vector component so no previous frame can leak through. */
export function writeCommandValues(
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
) {
	command.mesh = mesh;
	command.pos[0] = positionX;
	command.pos[1] = positionY;
	command.pos[2] = positionZ;
	command.scale[0] = scaleX;
	command.scale[1] = scaleY;
	command.scale[2] = scaleZ;
	command.rot = rotation;
	command.color[0] = red;
	command.color[1] = green;
	command.color[2] = blue;
	command.alpha = alpha;
	command.glow = glow;
	command.tilt = tilt;
	command.material = material;
	return command;
}

function emptyCommand() {
	return {
		mesh: 'cube',
		pos: [0, 0, 0],
		scale: [1, 1, 1],
		rot: 0,
		color: [1, 1, 1],
		alpha: 1,
		glow: 0,
		tilt: 0,
		material: 'none'
	};
}
