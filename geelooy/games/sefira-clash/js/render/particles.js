/**
 * B"H
 * Lightweight particle renderer.
 *
 * Chapter 168: when combat clumps, text and gradients are the tax collectors.
 * This renderer favors tiny lines, rings, and only a few glyphs so explosions
 * remain readable without murdering mobile FPS.
 */
export function drawParticles(ctx, particles) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const alpha = Math.max(0, p.life / (p.maxLife || 64));
    ctx.globalAlpha = alpha;
    if (p.kind === 'letter' || p.kind === 'number' || p.kind === 'callout') drawGlyph(ctx, p);
    else if (p.kind === 'ring') drawRing(ctx, p);
    else if (p.kind === 'slash') drawSlash(ctx, p);
    else drawSpark(ctx, p);
  }
  ctx.globalAlpha = 1;
}

function drawSpark(ctx, p) {
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
  ctx.lineTo(p.x + p.vx, p.y + p.vy);
  ctx.stroke();
}

function drawSlash(ctx, p) {
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x - p.size * 0.38, p.y - 6);
  ctx.lineTo(p.x + p.size * 0.38, p.y + 6);
  ctx.stroke();
}

function drawRing(ctx, p) {
  const progress = 1 - p.life / (p.maxLife || 20);
  const r = Math.max(8, p.size * progress);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(2, 7 * (1 - progress));
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawGlyph(ctx, p) {
  if ((p.kind === 'letter' || p.kind === 'callout') && p.life % 2) return;
  ctx.font = `900 ${Math.min(p.size || 24, 34)}px system-ui`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#050207';
  ctx.lineWidth = 4;
  ctx.strokeText(p.text, p.x, p.y);
  ctx.fillStyle = p.color;
  ctx.fillText(p.text, p.x, p.y);
}
