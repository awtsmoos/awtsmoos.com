/**
 * B"H
 * High-performance magical particle renderer.
 *
 * Chapter 31: the glyphs whirl, but the renderer stays lean. No gradients per
 * spark, no allocations, just lines, rings, slashes, and Hebrew letters drawn
 * with restrained shadow so the impact feels enormous without devouring FPS.
 */
export function drawParticles(ctx, particles) {
  for (let i = 0; i < particles.length; i++) drawParticle(ctx, particles[i]);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawParticle(ctx, p) {
  const alpha = Math.max(0, p.life / (p.maxLife || 64));
  ctx.globalAlpha = alpha;
  if (p.kind === 'letter') drawLetter(ctx, p, alpha);
  else if (p.kind === 'number' || p.kind === 'callout') drawGlyph(ctx, p, alpha);
  else if (p.kind === 'ring') drawRing(ctx, p, alpha);
  else if (p.kind === 'slash') drawSlash(ctx, p, alpha);
  else drawSpark(ctx, p, alpha);
}

function drawSpark(ctx, p, alpha) {
  ctx.shadowBlur = alpha > 0.5 ? 8 : 0;
  ctx.shadowColor = p.color;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = p.size ? 2.4 : 2;
  ctx.beginPath();
  ctx.moveTo(p.x - p.vx * 2.1, p.y - p.vy * 2.1);
  ctx.lineTo(p.x + p.vx * 0.7, p.y + p.vy * 0.7);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawSlash(ctx, p, alpha) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin || 0.35);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(2, 5 * alpha);
  ctx.beginPath();
  ctx.moveTo(-p.size * 0.45, -7);
  ctx.lineTo(p.size * 0.45, 7);
  ctx.stroke();
  ctx.restore();
}

function drawRing(ctx, p, alpha) {
  const progress = 1 - p.life / (p.maxLife || 20);
  const r = Math.max(8, p.size * progress);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(2, 9 * (1 - progress));
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
  if (progress < 0.28) drawCrossFlash(ctx, p, alpha);
}

function drawCrossFlash(ctx, p, alpha) {
  const r = p.size * 0.34;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 3 * alpha;
  ctx.beginPath();
  ctx.moveTo(p.x - r, p.y);
  ctx.lineTo(p.x + r, p.y);
  ctx.moveTo(p.x, p.y - r);
  ctx.lineTo(p.x, p.y + r);
  ctx.stroke();
}

function drawLetter(ctx, p, alpha) {
  if (alpha < 0.22 && p.life % 2) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin || 0);
  ctx.font = `950 ${Math.min(p.size || 24, 40)}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = alpha > 0.5 ? 9 : 0;
  ctx.shadowColor = p.color;
  ctx.strokeStyle = '#050207';
  ctx.lineWidth = 4;
  ctx.strokeText(p.text, 0, 0);
  ctx.fillStyle = p.color;
  ctx.fillText(p.text, 0, 0);
  ctx.restore();
  ctx.shadowBlur = 0;
}

function drawGlyph(ctx, p, alpha) {
  ctx.font = `950 ${Math.min(p.size || 24, 38)}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowBlur = p.kind === 'callout' ? 12 * alpha : 4;
  ctx.shadowColor = p.color;
  ctx.strokeStyle = '#050207';
  ctx.lineWidth = p.kind === 'callout' ? 6 : 4;
  ctx.strokeText(p.text, p.x, p.y);
  ctx.fillStyle = p.color;
  ctx.fillText(p.text, p.x, p.y);
  ctx.shadowBlur = 0;
}
