/**
 * B"H
 * Offscreen fighter edge indicators with dizzy warning.
 *
 * Chapter 100: no stunned soul disappears beyond the camera. If a crushed head
 * is off-screen, the border beacon grows a confusion mark so players know where
 * the seven-second window is burning.
 */
export function drawOffscreenIndicators(ctx, state, w, h) {
  const cam = state.camera || { x: 0, y: 0, zoom: 1 };
  const view = visibleWorldRect(cam, w, h, cam.zoom || 1);
  for (const f of state.fighters) {
    if (f.dead || isVisible(f, view)) continue;
    drawIndicator(ctx, f, projectToEdge(f, view, w, h));
  }
}

function visibleWorldRect(cam, w, h, zoom) {
  const cx = w / 2 - cam.x, cy = h / 2 - cam.y, halfW = w / (2 * zoom), halfH = h / (2 * zoom);
  return { left: cx - halfW, right: cx + halfW, top: cy - halfH, bottom: cy + halfH };
}
function isVisible(f, view) { return f.x > view.left && f.x < view.right && f.y > view.top && f.y < view.bottom; }
function projectToEdge(f, view, w, h) {
  const nx = (f.x - view.left) / Math.max(1, view.right - view.left), ny = (f.y - view.top) / Math.max(1, view.bottom - view.top);
  const margin = 34, x = clamp(nx * w, margin, w - margin), y = clamp(ny * h, 128, h - margin);
  const side = nx < 0 ? 'left' : nx > 1 ? 'right' : ny < 0 ? 'top' : 'bottom';
  return { x: side === 'left' ? margin : side === 'right' ? w - margin : x, y: side === 'top' ? 128 : side === 'bottom' ? h - margin : y, side };
}
function drawIndicator(ctx, f, p) {
  const color = `hsl(${f.dna.hue} 90% 62%)`, dizzy = f.diveStunned > 0;
  ctx.save(); ctx.translate(p.x, p.y); rotateTowardSide(ctx, p.side);
  ctx.fillStyle = dizzy ? 'rgba(32,8,54,.84)' : 'rgba(0,0,0,.72)'; ctx.strokeStyle = dizzy ? '#7fffdc' : color; ctx.lineWidth = dizzy ? 5 : 3;
  ctx.beginPath(); ctx.arc(0, 0, dizzy ? 27 : 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dizzy ? '#7fffdc' : color;
  if (dizzy) drawDizzyGlyph(ctx); else drawArrowShape(ctx);
  ctx.rotate(-rotationFor(p.side));
  ctx.font = '900 10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff7c9'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
  const timer = dizzy ? ` 🌀${Math.ceil(f.diveStunned / 60)}s` : '';
  const label = `${f.human ? 'YOU' : 'NPC'} ${Math.round(f.damage)}%${timer}`;
  ctx.strokeText(label, 0, 38); ctx.fillText(label, 0, 38); ctx.restore();
}
function drawArrowShape(ctx) { ctx.beginPath(); ctx.moveTo(17, 0); ctx.lineTo(-7, -11); ctx.lineTo(-3, 0); ctx.lineTo(-7, 11); ctx.closePath(); ctx.fill(); }
function drawDizzyGlyph(ctx) { ctx.font = '900 26px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🌀', 0, 1); }
function rotateTowardSide(ctx, side) { ctx.rotate(rotationFor(side)); }
function rotationFor(side) { return side === 'left' ? Math.PI : side === 'top' ? -Math.PI / 2 : side === 'bottom' ? Math.PI / 2 : 0; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
