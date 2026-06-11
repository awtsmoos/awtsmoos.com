import { radialGlow } from './lighting/glow.js';

/**
 * B"H
 * Fast, richer particle renderer.
 *
 * Chapter 47: the renderer now recognizes the wound's full vocabulary: sparks,
 * glyphs, damage numbers, shock rings, slash trails, and callouts. Each kind
 * is drawn by a narrow path so the frame remains a throne, not a battlefield
 * of wasted canvas state.
 */
export function drawParticles(ctx, particles) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const alpha = Math.max(0, p.life / (p.maxLife || 64));
    ctx.globalAlpha = alpha;
    if (p.kind === 'letter' || p.kind === 'number' || p.kind === 'callout') drawGlyph(ctx, p);
    else if (p.kind === 'ring') drawRing(ctx, p, alpha);
    else if (p.kind === 'slash') drawSlash(ctx, p);
    else drawSpark(ctx, p);
  }
  ctx.globalAlpha = 1;
}

function drawSpark(ctx, p) {
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x - p.vx * 2.8, p.y - p.vy * 2.8);
  ctx.lineTo(p.x + p.vx * 1.9, p.y + p.vy * 1.9);
  ctx.stroke();
}

function drawSlash(ctx, p) {
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p.x - p.size * 0.5, p.y - 10);
  ctx.quadraticCurveTo(p.x, p.y - 26, p.x + p.size * 0.5, p.y + 10);
  ctx.stroke();
}

function drawRing(ctx, p, alpha) {
  const progress = 1 - p.life / (p.maxLife || 20);
  const r = Math.max(8, p.size * progress);
  radialGlow(ctx, p.x, p.y, r * 0.55, p.color);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(2, 10 * (1 - progress));
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = alpha;
}

function drawGlyph(ctx, p) {
  const isLetter = p.kind === 'letter';
  const isCallout = p.kind === 'callout';
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin || 0);
  ctx.font = `900 ${p.size || 28}px ${isLetter ? 'serif' : 'system-ui'}`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#050207';
  ctx.lineWidth = isCallout ? 8 : isLetter ? 5 : 7;
  ctx.strokeText(p.text, 0, 0);
  ctx.fillStyle = p.color;
  ctx.fillText(p.text, 0, 0);
  ctx.restore();
}
