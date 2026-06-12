/**
 * B"H
 * Offscreen fighter edge indicators.
 * When an NPC flies beyond the visible sheet, the Awtsmoos pins a glowing sign
 * to the border: arrow, color, damage, and vertical truth. No soul vanishes.
 */
export function drawOffscreenIndicators(ctx, state, w, h) {
  const cam = state.camera || { x: 0, y: 0, zoom: 1 };
  const zoom = cam.zoom || 1;
  const view = visibleWorldRect(cam, w, h, zoom);
  for (const f of state.fighters) {
    if (f.dead || isVisible(f, view)) continue;
    drawIndicator(ctx, f, projectToEdge(f, view, w, h), w, h);
  }
}

function visibleWorldRect(cam, w, h, zoom) {
  const cx = w / 2 - cam.x;
  const cy = h / 2 - cam.y;
  const halfW = w / (2 * zoom);
  const halfH = h / (2 * zoom);
  return { left: cx - halfW, right: cx + halfW, top: cy - halfH, bottom: cy + halfH };
}

function isVisible(f, view) {
  return f.x > view.left && f.x < view.right && f.y > view.top && f.y < view.bottom;
}

function projectToEdge(f, view, w, h) {
  const nx = (f.x - view.left) / Math.max(1, view.right - view.left);
  const ny = (f.y - view.top) / Math.max(1, view.bottom - view.top);
  const margin = 34;
  const x = clamp(nx * w, margin, w - margin);
  const y = clamp(ny * h, 128, h - margin);
  const side = nx < 0 ? 'left' : nx > 1 ? 'right' : ny < 0 ? 'top' : 'bottom';
  return { x: side === 'left' ? margin : side === 'right' ? w - margin : x, y: side === 'top' ? 128 : side === 'bottom' ? h - margin : y, side };
}

function drawIndicator(ctx, f, p) {
  const color = `hsl(${f.dna.hue} 90% 62%)`;
  ctx.save();
  ctx.translate(p.x, p.y);
  rotateTowardSide(ctx, p.side);
  ctx.fillStyle = 'rgba(0,0,0,.72)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(17, 0);
  ctx.lineTo(-7, -11);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-7, 11);
  ctx.closePath();
  ctx.fill();
  ctx.rotate(-rotationFor(p.side));
  ctx.font = '900 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff7c9';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  const label = `${f.human ? 'YOU' : 'NPC'} ${Math.round(f.damage)}%`;
  ctx.strokeText(label, 0, 38);
  ctx.fillText(label, 0, 38);
  ctx.restore();
}

function rotateTowardSide(ctx, side) { ctx.rotate(rotationFor(side)); }
function rotationFor(side) { return side === 'left' ? Math.PI : side === 'top' ? -Math.PI / 2 : side === 'bottom' ? Math.PI / 2 : 0; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
