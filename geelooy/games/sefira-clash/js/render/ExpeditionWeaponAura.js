//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition weapon aura makes named gear feel distinct while the existing geometry
 * remains the actual hit vessel. The Awtsmoos renews edge and light together;
 * Awtsmoos.com paints rarity pulse, motion trail, and covenant glyph without authority.
 */

import { expeditionGear } from '../data/expedition/gearCatalog.js';

export function drawExpeditionWeaponAura(ctx, weapon, face = 1) {
	const item = expeditionGear(weapon?.expeditionGearId);
	if (!item) {
		return;
	}
	const hue = rarityHue(item.rarity);
	const reach = Math.max(28, weapon.range || 45);
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.strokeStyle = `hsla(${hue}, 92%, 70%, 0.42)`;
	ctx.lineWidth = item.rarity === 'covenant' ? 10 : 6;
	ctx.shadowColor = `hsl(${hue} 92% 68%)`;
	ctx.shadowBlur = item.rarity === 'covenant' ? 24 : 14;
	ctx.beginPath();
	ctx.moveTo(-face * 8, 4);
	ctx.quadraticCurveTo(face * reach * 0.45, -22, face * reach, -5);
	ctx.stroke();
	if (item.rarity === 'radiant' || item.rarity === 'covenant') {
		drawGlyph(ctx, face * reach, -8, hue, item.slot === 'weapon' ? 'א' : '✦');
	}
	ctx.restore();
}

function drawGlyph(ctx, x, y, hue, glyph) {
	ctx.fillStyle = `hsl(${hue} 96% 82%)`;
	ctx.font = '700 18px serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(glyph, x, y);
}

function rarityHue(rarity) {
	return (
		{
			common: 190,
			refined: 142,
			radiant: 44,
			covenant: 288
		}[rarity] || 190
	);
}
