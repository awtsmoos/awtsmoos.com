// B"H
// js/render.js

import { TILE_SIZE } from './data/database.js'; // <-- CORRECTED IMPORT

export function renderGameState(ctx, state) {
    if (!ctx || !state || !state.player || state.mode === 'battle') return;

    const p = state.player;
    const map = state.maps[state.currentMapId];
    if (!map) {
        // If map is missing, draw an error instead of a black screen
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Error: Map "${state.currentMapId}" not found!`, ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    const cameraOffsetX = (ctx.canvas.width / 2) - (p.pixelX + TILE_SIZE / 2);
    const cameraOffsetY = (ctx.canvas.height / 2) - (p.pixelY + TILE_SIZE / 2);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = `${TILE_SIZE * 0.8}px 'Segoe UI Emoji'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const renderLayer = (layer) => {
        for (let y = 0; y < layer.length; y++) {
            for (let x = 0; x < layer[y].length; x++) {
                if (layer[y][x]) {
                    ctx.fillText(layer[y][x], x * TILE_SIZE + TILE_SIZE / 2 + cameraOffsetX, y * TILE_SIZE + TILE_SIZE / 2 + cameraOffsetY);
                }
            }
        }
    };
    renderLayer(map.baseLayer);
    renderLayer(map.overlayLayer);

    ctx.font = `${TILE_SIZE * 0.7}px Arial`;
    for (const key in map.interactables) {
        const entity = map.interactables[key];
        if (entity.type === 'npc' && entity.questState && entity.questState !== 'none') {
            let indicator = '';
            let color = '#fff';
            if(entity.questState === 'available') { indicator = '❗️'; color = '#ffdd00'; }
            if(entity.questState === 'in_progress') { indicator = '❓'; color = '#a0a0a0'; }
            if(entity.questState === 'completed') { indicator = '❔'; color = '#ffd700'; }
            ctx.fillStyle = color;
            ctx.fillText(indicator, entity.x * TILE_SIZE + TILE_SIZE / 2 + cameraOffsetX, entity.y * TILE_SIZE - TILE_SIZE / 3 + cameraOffsetY);
        }
    }
    ctx.fillStyle = '#eee';
    ctx.font = `${TILE_SIZE * 0.8}px 'Segoe UI Emoji'`;

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    if (p.direction === 'right') ctx.scale(-1, 1);
    else if (p.direction === 'up') ctx.rotate(Math.PI / 2);
    else if (p.direction === 'down') ctx.rotate(-Math.PI / 2);
    ctx.fillText(p.emoji, 0, 0);
    ctx.restore();
}