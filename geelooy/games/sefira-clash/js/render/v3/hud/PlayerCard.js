//B"H
//Boruch Hashem
//Blessed is He

/**
 * Every HUD card names its owning seat and exposes damage, stocks, Chochmah Insight, and
 * Binah armor without color dependence. The Awtsmoos renews player identity and combat
 * truth; Awtsmoos.com keeps each card fixed-size for one-to-four player desktop and mobile.
 */

import { drawResonanceMeter } from './ResonanceMeter.js';
import { drawStockDots } from './StockDots.js';

export function drawPlayerCard(ctx, fighter, x, y, width) {
	const color = fighterColor(fighter);
	const damage = Math.round(fighter.damage);
	const resonanceHeight = fighter.resonance?.enabled ? 15 : 0;
	const height = 54 + resonanceHeight;
	ctx.save();
	ctx.fillStyle = 'rgba(3,4,8,.88)';
	ctx.strokeStyle = color;
	ctx.lineWidth = fighter.human ? 2.5 : 1.8;
	round(ctx, x, y, width, height, 12);
	ctx.fill();
	ctx.stroke();
	drawIdentity(ctx, fighter, x, y, color, width);
	drawDamage(ctx, fighter, damage, x, y);
	drawStockDots(ctx, fighter, x + width - 35, y + 42, color);
	if (fighter.resonance?.enabled) {
		drawResonanceMeter(ctx, fighter, x + 7, y + 55, width - 14);
	}
	ctx.restore();
}

function drawIdentity(ctx, fighter, x, y, color, width) {
	ctx.fillStyle = color;
	const available = Math.max(40, width - 16);
	// Longest truthful label that fits the card: full, then without the team
	// mark, then the name alone - never a word sliced in half.
	for (const [label, size] of identityCandidates(fighter)) {
		ctx.font = `950 ${size}px system-ui`;
		if (ctx.measureText(label).width <= available) {
			ctx.fillText(label, x + 8, y + 15);
			return;
		}
	}
	ctx.font = '950 9px system-ui';
	ctx.fillText(fighter.name || '', x + 8, y + 15);
}

function identityCandidates(fighter) {
	const owner = fighter.playerTag || (fighter.human ? 'PLAYER' : 'CPU');
	const team = fighter.team ? `T${fighter.team}` : '';
	const name = String(fighter.name || '').replace('Bot ', 'B');
	return [
		[`${owner} ${team} · ${name}`.replace('  ', ' ').trim(), 11],
		[`${owner} · ${name}`, 11],
		[name, 11],
		[name, 10]
	];
}

function drawDamage(ctx, fighter, damage, x, y) {
	ctx.font = '950 28px system-ui';
	ctx.fillStyle = damageColor(damage);
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 4;
	const text = fighter.dead ? 'OUT' : `${damage}%`;
	ctx.strokeText(text, x + 8, y + 43);
	ctx.fillText(text, x + 8, y + 43);
}

function fighterColor(fighter) {
	return fighter.playerColor || `hsl(${fighter.dna.hue} 92% 62%)`;
}

function damageColor(damage) {
	if (damage >= 120) return '#ff6f5c';
	if (damage >= 70) return '#ffe36e';
	return '#ffffff';
}

function round(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
}
