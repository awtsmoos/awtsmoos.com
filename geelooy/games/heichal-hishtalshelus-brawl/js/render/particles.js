import { radialGlow } from './lighting/glow.js';

/**
 * B"H — Particle renderer: hits now bloom into bright starbursts, matching
 * the reference's magical combat flares while staying simple and fast.
 */
export function drawParticles(ctx, particles) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / 28);
    ctx.globalAlpha = alpha;
    radialGlow(ctx, p.x, p.y, 16, p.color);
    ctx.strokeStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
    ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
