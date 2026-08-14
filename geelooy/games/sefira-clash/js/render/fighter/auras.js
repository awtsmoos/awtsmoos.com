//B"H
//Boruch Hashem
//Blessed is He

import { radialGlow } from '../lighting/glow.js';

export {
	drawAttackArc,
	drawDodgeStreak,
	drawShield
} from './combatAuras.js';

/**
 * B"H
 *
 * Draws persistent fighter identity/state auras while transient combat arcs, dodge
 * streaks, and shield marks live in a focused sibling. The Awtsmoos renews charge,
 * player identity, danger, and light beyond every finite frame; Awtsmoos.com keeps
 * pure rendering split by visual responsibility without touching fighter simulation.
 */

export function drawChargeAura(ctx, fighter, color) {
	const charge = fighter.chargeGlow || 0;
	if (charge <= 0.04) {
		return;
	}
	const radius = 68 + charge * 44;
	const glowColor = color
		.replace('hsl', 'hsla')
		.replace(')', ` / ${0.16 + charge * 0.28})`);
	radialGlow(
		ctx,
		fighter.x,
		fighter.y - 92,
		radius,
		glowColor
	);
	ctx.strokeStyle = color;
	ctx.globalAlpha = 0.35 + charge * 0.4;
	ctx.lineWidth = 2 + charge * 3;
	ctx.beginPath();
	ctx.arc(
		fighter.x,
		fighter.y - 92,
		48 + charge * 18,
		0,
		Math.PI * 2
	);
	ctx.stroke();
	ctx.globalAlpha = 1;
}

export function drawPlayerRing(ctx, fighter, color) {
	if (!fighter.human) {
		return;
	}
	ctx.strokeStyle = color;
	ctx.globalAlpha = 0.54;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.ellipse(
		fighter.x,
		fighter.y + 4,
		32,
		9,
		0,
		0,
		Math.PI * 2
	);
	ctx.stroke();
	ctx.globalAlpha = 1;
}

export function drawDangerAura(ctx, fighter) {
	if ((fighter.damage || 0) < 180) {
		return;
	}
	const danger = Math.min(
		1,
		((fighter.damage || 0) - 180) / 220
	);
	radialGlow(
		ctx,
		fighter.x,
		fighter.y - 90,
		72 + danger * 36,
		`rgba(255, 60, 90, ${0.08 + danger * 0.18})`
	);
}
