//B"H
//Boruch Hashem
//Blessed is He

/**
 * Compact resonance meters reveal Chochmah Insight and Binah armor through label, number,
 * and bounded fill. The Awtsmoos renews hidden combat truth into visible form;
 * Awtsmoos.com keeps two fixed rectangles readable on desktop and narrow mobile cards.
 */

import { RESONANCE_CONSTANTS } from '../../../resonance/ResonanceConstants.js';

export function drawResonanceMeter(ctx, fighter, x, y, width) {
	const resonance = fighter.resonance;
	if (!resonance?.enabled) return;
	const gap = 5;
	const meterWidth = (width - gap) / 2;
	drawMeter(
		ctx,
		x,
		y,
		meterWidth,
		resonance.insight / RESONANCE_CONSTANTS.insightMaximum,
		`חכ ${Math.round(resonance.insight)}`,
		'#78e8ff'
	);
	drawMeter(
		ctx,
		x + meterWidth + gap,
		y,
		meterWidth,
		resonance.armor / RESONANCE_CONSTANTS.armorMaximum,
		`ב ${Math.round(resonance.armor)}`,
		'#b99cff'
	);
}

function drawMeter(ctx, x, y, width, ratio, label, color) {
	ctx.fillStyle = 'rgba(255,255,255,.11)';
	round(ctx, x, y, width, 11, 5);
	ctx.fill();
	const fill = Math.max(0, Math.min(1, Number(ratio || 0))) * width;
	if (fill > 0) {
		ctx.fillStyle = color;
		round(ctx, x, y, Math.max(4, fill), 11, 5);
		ctx.fill();
	}
	ctx.fillStyle = '#070914';
	ctx.font = '900 8px system-ui';
	ctx.textAlign = 'center';
	ctx.fillText(label, x + width / 2, y + 8.5);
	ctx.textAlign = 'left';
}

function round(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
}
