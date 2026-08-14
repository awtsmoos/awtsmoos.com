//B"H
//Boruch Hashem
//Blessed is He

import { radialGlow } from '../lighting/glow.js';

/**
 * B"H
 *
 * Draws transient combat-only fighter effects after the broader aura system decides
 * they should be visible. The Awtsmoos renews dodge, shield, hand, and strike beyond
 * every finite frame; Awtsmoos.com keeps these pure render marks outside charge and
 * danger identity so visual combat layers remain small and impossible to own gameplay.
 */

export function drawDodgeStreak(ctx, fighter, color) {
	ctx.globalAlpha = 0.34;
	ctx.strokeStyle = color;
	ctx.lineWidth = 12;
	ctx.beginPath();
	ctx.moveTo(
		fighter.x - (fighter.vx || 0) * 4,
		fighter.y - 95 - (fighter.vy || 0) * 2
	);
	ctx.lineTo(fighter.x, fighter.y - 95);
	ctx.stroke();
	ctx.globalAlpha = 1;
}

export function drawShield(ctx, fighter) {
	ctx.strokeStyle = '#9affc5cc';
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.arc(
		fighter.x + (fighter.face || 1) * 22,
		fighter.y - 82,
		46,
		0,
		Math.PI * 2
	);
	ctx.stroke();
}

export function drawAttackArc(ctx, fighter, color) {
	const hand = fighter.bones.rightLowerArm?.tip || {
		x: fighter.x + (fighter.face || 1) * 50,
		y: fighter.y - 90
	};
	const fullCharge = Boolean(fighter.attack.fullCharge);
	const glowRadius = fullCharge ? 96 : 50;
	const glowColor = fullCharge
		? '#fff2a888'
		: translucentColor(color);

	radialGlow(
		ctx,
		hand.x,
		hand.y,
		glowRadius,
		glowColor
	);
	ctx.strokeStyle = fullCharge ? '#fff2a8' : color;
	ctx.lineWidth = fullCharge ? 9 : 5;
	ctx.beginPath();
	ctx.arc(
		fighter.x + (fighter.face || 1) * 50,
		fighter.y - 95,
		fullCharge ? 88 : 55,
		-0.8,
		0.8
	);
	ctx.stroke();
}

function translucentColor(color) {
	return color
		.replace('hsl', 'hsla')
		.replace(')', ' / .45)');
}
