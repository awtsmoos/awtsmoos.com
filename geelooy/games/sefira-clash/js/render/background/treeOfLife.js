import { treeNodes, TREE_PATHS } from '../geometry/sefirotTree.js';

/**
 * B"H — Draws the faded Etz Chaim, the mockup's central seal. It remains
 * behind the fighters, large and quiet, so gameplay stays readable while
 * the chamber feels ancient, intentional, and Kabbalah-rooted.
 */
export function drawTreeOfLife(ctx, w, h, palette) {
  const nodes = treeNodes(w * 0.5, h * 0.49, Math.min(w, h) * 0.105);
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  ctx.save();
  ctx.globalAlpha = 0.23;
  ctx.strokeStyle = palette.line;
  ctx.fillStyle = palette.line;
  ctx.lineWidth = 2;
  drawOuterRings(ctx, w, h, palette);
  for (const [a, b] of TREE_PATHS) drawPath(ctx, byId[a], byId[b]);
  for (const node of nodes) drawNode(ctx, node);
  ctx.restore();
}

function drawOuterRings(ctx, w, h, palette) {
  ctx.strokeStyle = palette.line;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(w / 2, h * .49, 115 + i * 42, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPath(ctx, a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawNode(ctx, n) {
  ctx.beginPath();
  ctx.arc(n.x, n.y, 19, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = '9px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(n.id, n.x, n.y + 3);
}
