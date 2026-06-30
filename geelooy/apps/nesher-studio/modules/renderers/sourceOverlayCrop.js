/* B"H
 * Crop overlay: dimming, thirds, and handles make the crop physically visible.
 */
import { cropBox, cropGuideLines } from '../stage/stageGeometry.js';

export function drawCropOverlay(ctx, source) {
  const b = cropBox(source); dimOutside(ctx, source, b); drawGuides(ctx, source); drawCropFrame(ctx, b); drawCropHandles(ctx, b);
}

function dimOutside(ctx, s, b) {
  ctx.fillStyle = '#020817a8'; ctx.fillRect(s.x, s.y, s.w, b.y - s.y); ctx.fillRect(s.x, b.y + b.h, s.w, s.y + s.h - b.y - b.h);
  ctx.fillRect(s.x, b.y, b.x - s.x, b.h); ctx.fillRect(b.x + b.w, b.y, s.x + s.w - b.x - b.w, b.h);
}
function drawGuides(ctx, source) {
  ctx.strokeStyle = '#ffd16688'; ctx.lineWidth = 1; cropGuideLines(source).forEach(g => { ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(g.x + (g.w || 0), g.y + (g.h || 0)); ctx.stroke(); });
}
function drawCropFrame(ctx, b) {
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.setLineDash([]);
}
function drawCropHandles(ctx, b) {
  ctx.fillStyle = '#ffd166'; [[b.x,b.y,'nw'],[b.x+b.w,b.y,'ne'],[b.x,b.y+b.h,'sw'],[b.x+b.w,b.y+b.h,'se']].forEach(([x,y,t]) => { ctx.fillRect(x - 7, y - 7, 14, 14); ctx.fillStyle = '#07101a'; ctx.font = '9px monospace'; ctx.fillText(t, x - 6, y + 3); ctx.fillStyle = '#ffd166'; });
}
