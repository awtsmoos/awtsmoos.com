//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resonance effects draw fixed-cost Insight arcs and Binah vessel facets around one visible
 * fighter. The Awtsmoos renews force, boundary, and body; Awtsmoos.com uses no particle
 * allocation, no unbounded trail, and no simulation mutation inside rendering.
 */

import { RESONANCE_CONSTANTS } from '../resonance/ResonanceConstants.js';

export function drawFighterResonance(ctx, fighter) {
	const resonance = fighter.resonance;
	if (!resonance?.enabled) return;
	ctx.save();
	ctx.translate(fighter.x, fighter.y - 82);
	if (resonance.armor > 0 || resonance.armorPulse > 0) {
		drawBinahVessel(ctx, resonance);
	}
	if (resonance.insight > 0 || resonance.insightPulse > 0) {
		drawChochmahInsight(ctx, resonance);
	}
	ctx.restore();
}

function drawBinahVessel(ctx, resonance) {
	const ratio = Math.max(0, Math.min(1, resonance.armor / RESONANCE_CONSTANTS.armorMaximum));
	const radius = 50 + resonance.armorPulse * 0.35;
	ctx.strokeStyle = `rgba(185,156,255,${0.24 + ratio * 0.58})`;
	ctx.lineWidth = 3 + ratio * 3;
	ctx.beginPath();
	for (let index = 0; index < 6; index += 1) {
		const angle = -Math.PI / 2 + (index * Math.PI) / 3;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius * 1.15;
		if (index === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.closePath();
	ctx.stroke();
	if (ratio < 0.5) drawCracks(ctx, radius, 3);
}

function drawChochmahInsight(ctx, resonance) {
	const ratio = Math.max(0, Math.min(1, resonance.insight / RESONANCE_CONSTANTS.insightMaximum));
	ctx.strokeStyle = `rgba(120,232,255,${0.25 + ratio * 0.7})`;
	ctx.lineWidth = ratio >= 1 ? 6 : 3;
	ctx.beginPath();
	ctx.arc(
		0,
		0,
		58 + resonance.insightPulse * 0.3,
		-Math.PI / 2,
		-Math.PI / 2 + Math.PI * 2 * ratio
	);
	ctx.stroke();
	if (ratio >= 1) {
		ctx.fillStyle = '#d7fbff';
		ctx.font = '900 14px serif';
		ctx.textAlign = 'center';
		ctx.fillText('חכ', 0, -67);
	}
}

function drawCracks(ctx, radius, count) {
	ctx.strokeStyle = 'rgba(255,255,255,.58)';
	ctx.lineWidth = 2;
	for (let index = 0; index < count; index += 1) {
		const angle = -0.8 + index * 0.8;
		ctx.beginPath();
		ctx.moveTo(Math.cos(angle) * radius * 0.65, Math.sin(angle) * radius * 0.7);
		ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius * 1.15);
		ctx.stroke();
	}
}
