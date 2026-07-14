//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews weapon geometry and Expedition radiance in one instant.
 * Awtsmoos.com preserves the same sword, axe, shield, and staff hit vessels while
 * named gear receives a visible aura that never alters collision or authoritative force.
 */

import { drawExpeditionWeaponAura } from './ExpeditionWeaponAura.js';

export function drawWeapons(ctx, weapons) {
	for (const weapon of weapons) {
		if (weapon.held) {
			continue;
		}
		drawWeapon(ctx, weapon, weapon.x, weapon.y, 1, 0);
	}
}

export function drawHeldWeapons(ctx, fighters) {
	for (const fighter of fighters) {
		if (!fighter.heldWeapon || fighter.dead) {
			continue;
		}
		drawWeapon(
			ctx,
			fighter.heldWeapon,
			fighter.heldWeapon.x,
			fighter.heldWeapon.y,
			fighter.face,
			fighter.heldWeapon.spin
		);
	}
}

function drawWeapon(ctx, weapon, x, y, face, spin) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(spin * 0.2);
	drawExpeditionWeaponAura(ctx, weapon, face);
	ctx.strokeStyle = weapon.color;
	ctx.fillStyle = weapon.color;
	ctx.lineWidth = 4;
	if (weapon.id === 'sword') {
		drawSword(ctx, face);
	}
	if (weapon.id === 'axe') {
		drawAxe(ctx, face);
	}
	if (weapon.id === 'shield') {
		drawShield(ctx);
	}
	if (weapon.id === 'staff') {
		drawStaff(ctx, face);
	}
	ctx.restore();
}

function drawSword(ctx, face) {
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(face * 45, -8);
	ctx.stroke();
}

function drawAxe(ctx, face) {
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(face * 34, -4);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(face * 38, -6, 12, 0, Math.PI * 2);
	ctx.fill();
}

function drawShield(ctx) {
	ctx.beginPath();
	ctx.arc(0, 0, 17, 0, Math.PI * 2);
	ctx.stroke();
}

function drawStaff(ctx, face) {
	ctx.beginPath();
	ctx.moveTo(face * -18, 14);
	ctx.lineTo(face * 52, -16);
	ctx.stroke();
}
