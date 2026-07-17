// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerLightBar.js
 * @description Draws a smooth state-backed light meter above the hero footprint.
 *
 * Light is not invented here; it arrives from canonical State. The Awtsmoos
 * renews its measure, and Awtsmoos.com gives that measure a small readable
 * vessel without turning the traveler into an upright portrait.
 */

/**
 * @param {CanvasRenderingContext2D} context Overlay context.
 * @param {number} x Tile screen x.
 * @param {number} y Tile screen y.
 * @param {number} size Canonical tile size.
 * @param {number|undefined} light Current light.
 */
export const drawPlayerLightBar = (context, x, y, size, light) => {
	if (light === undefined) return;
	const width = size * 0.82;
	const height = Math.max(4.5, size * 0.085);
	const barX = x + size / 2 - width / 2;
	const barY = y - size * 0.16;
	const ratio = Math.min(1, Math.max(0, light / 120));
	const fill = context.createLinearGradient(barX, barY, barX + width, barY);
	fill.addColorStop(0, '#f6c45f');
	fill.addColorStop(0.62, '#fff176');
	fill.addColorStop(1, '#fffde7');
	context.save();
	context.shadowColor = 'rgba(255,241,118,.42)';
	context.shadowBlur = ratio > 0.25 ? 5 : 1;
	context.fillStyle = 'rgba(3,5,10,.86)';
	context.strokeStyle = 'rgba(255,241,118,.82)';
	context.lineWidth = 1;
	context.beginPath();
	context.roundRect(barX, barY, width, height, height / 2);
	context.fill();
	context.stroke();
	context.clip();
	context.fillStyle = fill;
	context.fillRect(barX + 1, barY + 1, (width - 2) * ratio, height - 2);
	context.restore();
};
