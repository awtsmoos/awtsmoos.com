import { panel } from './panels.js';
import { drawMapPreview } from '../minimap/mapPreview.js';

/**
 * B"H — Map cards become live miniature canvases. The mockup's right panel
 * now reflects the real map data: platforms, theme, blast outline, names.
 */
export function drawMapCards(ctx, state, maps, w) {
  if (w < 920) return;
  const x = w - 352;
  const y = 72;
  panel(ctx, x, y, 338, 68, 'MAP SELECT');
  for (let i = 0; i < Math.min(3, maps.length); i++) {
    const cardX = x + 14 + i * 104;
    const selected = maps[i].id === state.map.id;
    ctx.strokeStyle = selected ? '#ffe36a' : 'rgba(255,255,255,.25)';
    ctx.strokeRect(cardX, y + 24, 92, 32);
    drawMapPreview(ctx, maps[i], cardX + 2, y + 26, 88, 20);
    ctx.fillStyle = '#fff3c0';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(maps[i].name, cardX + 46, y + 64);
    ctx.textAlign = 'start';
  }
}
