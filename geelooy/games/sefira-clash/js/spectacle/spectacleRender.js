/**
 * B"H
 * Spectacle renderer.
 *
 * Chapter 9: the screen becomes a drumskin. The Awtsmoos has no body and no
 * form, yet every finite color is carried by His speech. Here the finite color
 * answers combat: white flash, amber pressure, expanding rings, violent streaks,
 * and afterimages like memory burned into air.
 */
export function drawSpectacleOverlay(ctx, state, w, h) {
  const s = state.spectacle;
  if (!s) return;
  drawWorldEchoes(ctx, state, w, h, s);
  drawScreenTint(ctx, s, w, h);
}

function drawWorldEchoes(ctx, state, w, h, s) {
  const zoom = state.camera?.zoom || 1;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(state.camera.x - w / 2, state.camera.y - h / 2);
  for (const image of s.afterimages || []) drawAfterimage(ctx, image);
  for (const streak of s.streaks || []) drawStreak(ctx, streak);
  for (const ring of s.rings || []) drawRing(ctx, ring);
  ctx.restore();
}

function drawAfterimage(ctx, image) {
  const alpha = fade(image) * 0.28;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `hsl(${image.hue} 92% 72%)`;
  ctx.beginPath();
  ctx.ellipse(image.x, image.y - 72, image.radius * 0.62, image.radius * 1.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawStreak(ctx, streak) {
  const alpha = fade(streak) * 0.72;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = streak.color;
  ctx.lineWidth = Math.max(2, streak.width * alpha);
  ctx.beginPath();
  ctx.moveTo(streak.x - streak.vx * 0.2, streak.y - streak.vy * 0.2);
  ctx.lineTo(streak.x + streak.vx, streak.y + streak.vy);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawRing(ctx, ring) {
  const progress = 1 - ring.life / (ring.maxLife || 1);
  const radius = ring.radius * (0.2 + progress * 0.95);
  const alpha = (1 - progress) * 0.82;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = ring.color;
  ctx.lineWidth = Math.max(1, ring.line * (1 - progress));
  ctx.beginPath();
  ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawScreenTint(ctx, s, w, h) {
  if (s.tint > 0.01) {
    ctx.globalAlpha = Math.min(0.22, s.tint);
    ctx.fillStyle = '#ffcf7a';
    ctx.fillRect(0, 0, w, h);
  }
  if (s.flash > 0.01) {
    ctx.globalAlpha = Math.min(0.42, s.flash);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalAlpha = 1;
}

function fade(item) {
  return Math.max(0, Math.min(1, item.life / (item.maxLife || 1)));
}
