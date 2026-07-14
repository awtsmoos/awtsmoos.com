//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition loadout painting makes armor, mantle, boots, and relic visible without
 * changing collision or pose. The Awtsmoos renews body and garment together;
 * Awtsmoos.com layers authored equipment accents over the existing sculpted fighter.
 */

import { expeditionGear } from '../data/expedition/gearCatalog.js';

export function drawExpeditionLoadout(ctx, fighter) {
	if (!fighter.human || !fighter.expeditionLoadout) {
		return;
	}
	const loadout = Object.fromEntries(
		Object.entries(fighter.expeditionLoadout).map(([slot, id]) => [slot, expeditionGear(id)])
	);
	ctx.save();
	ctx.translate(fighter.x, fighter.y);
	ctx.globalAlpha = fighter.respawnTimer ? 0.35 : 0.92;
	drawMantle(ctx, loadout.mantle, fighter.face || 1);
	drawArmor(ctx, loadout.armor);
	drawBoots(ctx, loadout.boots);
	drawRelic(ctx, loadout.relic, fighter.motionClock || 0);
	ctx.restore();
}

function drawArmor(ctx, item) {
	if (!item) {
		return;
	}
	ctx.fillStyle = rarityColor(item.rarity, 0.32);
	ctx.strokeStyle = rarityColor(item.rarity, 0.85);
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.roundRect(-28, -112, 56, 58, 14);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(-23, -93);
	ctx.lineTo(23, -93);
	ctx.stroke();
}

function drawMantle(ctx, item, face) {
	if (!item) {
		return;
	}
	ctx.fillStyle = rarityColor(item.rarity, 0.28);
	ctx.beginPath();
	ctx.moveTo(-face * 12, -105);
	ctx.lineTo(-face * 50, -70);
	ctx.lineTo(-face * 35, -18);
	ctx.lineTo(-face * 8, -55);
	ctx.closePath();
	ctx.fill();
}

function drawBoots(ctx, item) {
	if (!item) {
		return;
	}
	ctx.strokeStyle = rarityColor(item.rarity, 0.95);
	ctx.lineWidth = 6;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(-22, -4);
	ctx.lineTo(-35, 0);
	ctx.moveTo(22, -4);
	ctx.lineTo(35, 0);
	ctx.stroke();
}

function drawRelic(ctx, item, clock) {
	if (!item) {
		return;
	}
	const pulse = 1 + Math.sin(clock * 0.08) * 0.14;
	ctx.strokeStyle = rarityColor(item.rarity, 0.95);
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(0, -130, 9 * pulse, 0, Math.PI * 2);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, -142);
	ctx.lineTo(0, -118);
	ctx.moveTo(-12, -130);
	ctx.lineTo(12, -130);
	ctx.stroke();
}

function rarityColor(rarity, alpha) {
	const hues = { common: 190, refined: 142, radiant: 44, covenant: 288 };
	return `hsla(${hues[rarity] || 190}, 86%, 70%, ${alpha})`;
}
