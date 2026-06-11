import { panel } from './panels.js';
import { drawBlastDiagram } from './blastDiagram.js';

/**
 * B"H — Technical dashboard panel: it fulfills the mockup's lower system
 * diagrams in a live, compact form, without stealing the main combat canvas.
 */
export function drawSystemsPanel(ctx, state, w, h) {
  if (w < 980 || h < 640) return;
  const y = h - 128;
  panel(ctx, 14, y, 520, 112, 'GAMEPLAY SYSTEMS OVERVIEW');
  ctx.fillStyle = '#efe4c1';
  ctx.font = '11px system-ui';
  writeList(ctx, ['Physics: gravity / platforms / blast zones', 'Combat: timed hitboxes / shields / weapons', 'AI: target / recover / attack / pickup', 'Render: parchment / sefiros / particles'], 28, y + 38);
  panel(ctx, 552, y, 300, 112, 'BLAST ZONE EXAMPLE');
  drawBlastDiagram(ctx, state, 574, y + 30, 128, 58);
}

function writeList(ctx, list, x, y) {
  list.forEach((text, i) => ctx.fillText(`• ${text}`, x, y + i * 18));
}
