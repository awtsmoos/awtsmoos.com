import { glyphImage } from './glyphAtlas.js';

/**
 * B"H
 * Atlas-backed magical particle renderer.
 *
 * Chapter 113: the Hebrew glyphs are no longer painted from font-layout fire on
 * every frame. They are cached as tiny images, then hurled through the world by
 * drawImage. If the browser cannot build an atlas, the old text path remains as
 * a humble fallback.
 */
const TEXT_FONT = '950 28px system-ui';
const SMALL_TEXT_FONT = '900 22px system-ui';
const CALLOUT_FONT = '950 34px system-ui';

export function drawParticles(ctx, particles) {
  const heavy = particles.length > 150;
  for (let i = 0; i < particles.length; i++) drawParticle(ctx, particles[i], heavy);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawParticle(ctx, p, heavy) {
  const alpha = Math.max(0, p.life / (p.maxLife || 64));
  if (alpha <= 0.03) return;
  ctx.globalAlpha = alpha;
  if (p.kind === 'letter') drawLetter(ctx, p, alpha, heavy);
  else if (p.kind === 'number' || p.kind === 'callout') drawGlyph(ctx, p, alpha, heavy);
  else if (p.kind === 'ring') drawRing(ctx, p, alpha, heavy);
  else if (p.kind === 'slash') drawSlash(ctx, p, alpha);
  else drawSpark(ctx, p, alpha, heavy);
}

function drawSpark(ctx, p, alpha, heavy) {
  ctx.shadowBlur = !heavy && alpha > 0.55 ? 5 : 0;
  ctx.shadowColor = p.color;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
  ctx.lineTo(p.x + p.vx * 0.6, p.y + p.vy * 0.6);
  ctx.stroke();
}

function drawSlash(ctx, p, alpha) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin || 0.35);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(2, 4 * alpha);
  ctx.beginPath();
  ctx.moveTo(-p.size * 0.42, -6);
  ctx.lineTo(p.size * 0.42, 6);
  ctx.stroke();
  ctx.restore();
}

function drawRing(ctx, p, alpha, heavy) {
  const progress = 1 - p.life / (p.maxLife || 20);
  const r = Math.max(8, p.size * progress);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(2, 7 * (1 - progress));
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
  if (!heavy && progress < 0.24) drawCrossFlash(ctx, p, alpha);
}

function drawCrossFlash(ctx, p, alpha) {
  const r = p.size * 0.3;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 2.5 * alpha;
  ctx.beginPath();
  ctx.moveTo(p.x - r, p.y);
  ctx.lineTo(p.x + r, p.y);
  ctx.moveTo(p.x, p.y - r);
  ctx.lineTo(p.x, p.y + r);
  ctx.stroke();
}

function drawLetter(ctx, p, alpha, heavy) {
  if (heavy && alpha < 0.18 && p.life % 2) return;
  if (drawAtlasGlyph(ctx, p, 'letter')) return;
  drawLetterFallback(ctx, p, alpha, heavy);
}

function drawGlyph(ctx, p, alpha, heavy) {
  if (drawAtlasGlyph(ctx, p, p.kind)) return;
  drawGlyphFallback(ctx, p, alpha, heavy);
}

function drawAtlasGlyph(ctx, p, kind) {
  const glyph = glyphImage(p.text, p.color, p.size || 28, kind);
  if (!glyph?.canvas) return false;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (kind === 'letter') ctx.rotate(p.spin || 0);
  ctx.drawImage(glyph.canvas, -glyph.width / 2, -glyph.height / 2, glyph.width, glyph.height);
  ctx.restore();
  return true;
}

function drawLetterFallback(ctx, p, alpha, heavy) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin || 0);
  ctx.font = p.size > 26 ? TEXT_FONT : SMALL_TEXT_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = !heavy && alpha > 0.62 ? 5 : 0;
  ctx.shadowColor = p.color;
  if (!heavy) {
    ctx.strokeStyle = '#050207';
    ctx.lineWidth = 3;
    ctx.strokeText(p.text, 0, 0);
  }
  ctx.fillStyle = p.color;
  ctx.fillText(p.text, 0, 0);
  ctx.restore();
}

function drawGlyphFallback(ctx, p, alpha, heavy) {
  ctx.font = p.kind === 'callout' ? CALLOUT_FONT : SMALL_TEXT_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowBlur = !heavy && p.kind === 'callout' ? 7 * alpha : 0;
  ctx.shadowColor = p.color;
  if (!heavy) {
    ctx.strokeStyle = '#050207';
    ctx.lineWidth = p.kind === 'callout' ? 5 : 3;
    ctx.strokeText(p.text, p.x, p.y);
  }
  ctx.fillStyle = p.color;
  ctx.fillText(p.text, p.x, p.y);
}
