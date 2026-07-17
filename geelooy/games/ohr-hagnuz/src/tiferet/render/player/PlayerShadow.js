// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerShadow.js
 * @description Draws a soft overhead contact shadow beneath the canonical hero.
 *
 * The Awtsmoos gives the traveler weight without tilting the camera. At
 * Awtsmoos.com this shadow remains a flat footprint clue, never a collision
 * shape, perspective trick, or second location.
 */

/**
 * @param {CanvasRenderingContext2D} context Overlay context.
 * @param {number} x Tile screen x.
 * @param {number} y Tile screen y.
 * @param {number} size Canonical tile size.
 * @param {boolean} moving Whether the hero is moving.
 */
export const drawPlayerShadow = (context, x, y, size, moving) => {
	const centerX = x + size / 2;
	const centerY = y + size * 0.72;
	const radiusX = size * (moving ? 0.27 : 0.3);
	const radiusY = size * 0.115;
	const shadow = context.createRadialGradient(
		centerX,
		centerY,
		0,
		centerX,
		centerY,
		radiusX
	);
	shadow.addColorStop(0, 'rgba(0,0,0,.34)');
	shadow.addColorStop(0.58, 'rgba(0,0,0,.18)');
	shadow.addColorStop(1, 'rgba(0,0,0,0)');
	context.save();
	context.fillStyle = shadow;
	context.beginPath();
	context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
	context.fill();
	context.restore();
};
