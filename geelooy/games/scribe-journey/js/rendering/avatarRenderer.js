// B"H

import { stableHash, WORLD_THEME } from './theme.js';

const HUMAN_WORDS = /rabbi|rebbe|mother|builder|digger|guard|merchant|scribe|elder|teacher|student|maccabee|levi|person|human|father|woman|man/i;
const HUMAN_GLYPHS = new Set(['🧑', '👨', '👩', '👴', '👵', '🧔', '🧙', '👤', '✍️']);

export function isHumanLike(entity = {}) {
	const glyph = entity.emoji || entity.visual || '';
	return HUMAN_GLYPHS.has(glyph) || HUMAN_WORDS.test(`${entity.id || ''} ${entity.name || ''}`);
}

function paletteFor(entity) {
	const hash = stableHash(`${entity.id || ''}:${entity.name || ''}:${entity.emoji || ''}`);
	const clothes = ['#3559a8', '#7c3da1', '#317d4d', '#b55f26', '#256f78'];
	const skin = ['#f0bd7b', '#d79558', '#9b633e', '#70462f'];
	const hair = ['#251811', '#4a2d1b', '#171717', '#765136', '#b08452'];
	return {
		clothes: clothes[hash % clothes.length],
		skin: skin[(hash >>> 4) % skin.length],
		hair: hair[(hash >>> 8) % hair.length]
	};
}

function directionOffset(direction) {
	if (direction === 'left') return -2;
	if (direction === 'right') return 2;
	return 0;
}

/** Draws one compact, deterministic traveler with a luminous interaction ring. */
export function drawAvatar(ctx, entity, x, y, options = {}) {
	const palette = paletteFor(entity);
	const scale = options.scale || 1;
	const eyeOffset = directionOffset(options.direction || entity.direction);
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(scale, scale);

	if (entity.questGiver || entity.shop || options.highlight) {
		ctx.strokeStyle = entity.questGiver ? WORLD_THEME.interaction : WORLD_THEME.cyan;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, -2, 19, 0, Math.PI * 2);
		ctx.stroke();
	}

	ctx.fillStyle = palette.clothes;
	ctx.beginPath();
	ctx.roundRect(-9, -1, 18, 20, 6);
	ctx.fill();
	ctx.fillStyle = palette.skin;
	ctx.beginPath();
	ctx.arc(0, -9, 9, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = palette.hair;
	ctx.beginPath();
	ctx.arc(0, -12, 9, Math.PI, 0);
	ctx.fill();

	ctx.fillStyle = '#111820';
	ctx.beginPath();
	ctx.arc(-3 + eyeOffset, -9, 1.1, 0, Math.PI * 2);
	ctx.arc(3 + eyeOffset, -9, 1.1, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = '#172026';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(-4, 17);
	ctx.lineTo(-6, 23);
	ctx.moveTo(4, 17);
	ctx.lineTo(6, 23);
	ctx.stroke();

	if (options.scribe) {
		ctx.strokeStyle = '#f5ecce';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(7, 2);
		ctx.lineTo(14, -9);
		ctx.stroke();
	}
	ctx.restore();
}
