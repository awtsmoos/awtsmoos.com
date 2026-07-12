// B"H

/** Render commands are complete immutable notes passed from world to WebGL. */
export function cmd(mesh, pos, scale, rot, color, alpha = 1, glow = 0, tilt = 0) {
	return { mesh, pos, scale, rot, color, alpha, glow, tilt };
}

export function shadow(commands, x, z, h, radius, alpha) {
	commands.push(cmd('disc', [x, h + 0.02, z], [radius, 1, radius * 0.78], 0, [0, 0, 0], alpha, 0));
}
