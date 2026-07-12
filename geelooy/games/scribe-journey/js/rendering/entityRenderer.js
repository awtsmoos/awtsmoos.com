// B"H

import { TILE_SIZE } from '../data/database.js';
import { drawAvatar, isHumanLike } from './avatarRenderer.js';
import { EMOJI_FONT, WORLD_THEME } from './theme.js';

function drawEntity(ctx, entity, camera) {
	const glyph = entity?.emoji || entity?.visual;
	if (!glyph || glyph === 'undefined') return;
	const worldX = entity.pixelX ?? entity.x * TILE_SIZE;
	const worldY = entity.pixelY ?? entity.y * TILE_SIZE;
	const x = Math.round(worldX + TILE_SIZE / 2 + camera.x);
	const y = Math.round(worldY + TILE_SIZE / 2 + camera.y);
	if (x < -40 || y < -60 || x > camera.viewport.width + 40 || y > camera.viewport.height + 60) return;

	ctx.fillStyle = WORLD_THEME.shadow;
	ctx.beginPath();
	ctx.ellipse(x, y + 16, 12, 5, 0, 0, Math.PI * 2);
	ctx.fill();
	const bounce = entity.questGiver || entity.shop ? Math.sin(performance.now() / 240) * 2 : 0;
	if (isHumanLike(entity)) drawAvatar(ctx, entity, x, y + bounce);
	else {
		ctx.font = `${Math.round(TILE_SIZE * 0.75)}px ${EMOJI_FONT}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(glyph, x, y + bounce);
	}

	if (entity.questGiver || entity.shop) {
		ctx.font = '700 14px ui-monospace, monospace';
		ctx.fillStyle = entity.questGiver ? WORLD_THEME.interaction : WORLD_THEME.cyan;
		ctx.fillText(entity.questGiver ? '!' : '◆', x, y - 29 + bounce);
	}
	if (entity.name) {
		ctx.font = '600 10px ui-monospace, monospace';
		ctx.fillStyle = '#f8f3df';
		ctx.fillText(entity.name, x, y + 32);
	}
}

export function drawEntities(ctx, renderState, camera) {
	for (const bot of renderState.bots || []) drawEntity(ctx, bot, camera);
	for (const entity of Object.values(renderState.map?.interactables || {})) drawEntity(ctx, entity, camera);
}
