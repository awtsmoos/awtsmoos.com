//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file compatibility2d-marks.js
 * @description Draws bounded compatibility marks for arena objects, the player,
 * and degraded-renderer status without owning simulation or camera state.
 *
 * Architectural invariants:
 * - Object size is clamped so tiny and enormous masses remain legible.
 * - Canonical RGB material color is translated without mutating source arrays.
 * - The player is visually unmistakable from ordinary consumable objects.
 * - Status text describes degradation without blocking play or obscuring the HUD.
 */

/** Draw one arena object relative to the centered player. */
export function drawCompatibilityObject(
	context,
	width,
	height,
	scale,
	object,
	deltaX,
	deltaY
) {
	const x = width / 2 + deltaX * scale;
	const y = height / 2 + deltaY * scale;
	const radius = clamp(object.r * scale, 2, 22);
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context.fillStyle = rgb(object.color, 0.82);
	context.fill();
	if (object.power) {
		drawPowerRing(context, x, y, radius);
	}
}

/** Draw the authoritative player at screen center with mass-scaled presence. */
export function drawCompatibilityPlayer(context, width, height, scale, player) {
	const x = width / 2;
	const y = height / 2;
	const radius = clamp(player.r * scale, 7, 34);

	context.beginPath();
	context.arc(x, y, radius + 5, 0, Math.PI * 2);
	context.fillStyle = 'rgba(255, 223, 108, 0.18)';
	context.fill();
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context.fillStyle = '#7edcff';
	context.fill();
	context.lineWidth = 2;
	context.strokeStyle = '#ffdf6c';
	context.stroke();
}

/** Announce compatibility rendering inside the canvas without covering gameplay. */
export function drawCompatibilityStatus(context, width, world) {
	const label = world.mode === 'paused'
		? 'COMPATIBILITY RENDERER · PAUSED'
		: 'COMPATIBILITY RENDERER';

	context.font = '600 12px system-ui, sans-serif';
	context.textAlign = 'center';
	context.fillStyle = 'rgba(255, 255, 255, 0.78)';
	context.fillText(label, width / 2, 20);
}

/** Draw one small ring around an object carrying an active power role. */
function drawPowerRing(context, x, y, radius) {
	context.beginPath();
	context.arc(x, y, radius + 4, 0, Math.PI * 2);
	context.lineWidth = 2;
	context.strokeStyle = 'rgba(255, 223, 108, 0.85)';
	context.stroke();
}

/** Convert shader-style normalized RGB into a browser CSS color. */
function rgb(color, alpha) {
	const values = Array.isArray(color) ? color : [0.49, 0.86, 1];
	const red = Math.round(clamp(values[0], 0, 1) * 255);
	const green = Math.round(clamp(values[1], 0, 1) * 255);
	const blue = Math.round(clamp(values[2], 0, 1) * 255);
	return `rgba(${red}, ${green}, ${blue}, ${clamp(alpha, 0, 1)})`;
}

/** Clamp finite drawing values without leaking NaN into Canvas commands. */
function clamp(value, minimum, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return minimum;
	}
	return Math.max(minimum, Math.min(maximum, number));
}
