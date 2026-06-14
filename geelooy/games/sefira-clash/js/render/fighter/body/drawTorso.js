/**
 * B"H
 * Broad humanoid torso renderer.
 *
 * Chapter 111: the stick becomes a fighter. Shoulders widen, waist narrows,
 * chest and abdomen breathe as one readable silhouette, and the Awtsmoos hides
 * the awkward triangle beneath a living body mass.
 */
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

function anchor(f) {
  const spine = f.bones?.spine;
  return {
    hip: spine?.root || { x: f.x, y: f.y - 56 },
    chest: spine?.tip || { x: f.x, y: f.y - 128 }
  };
}

function metrics(f, language) {
  const h = clamp(f?.dna?.height || 1, 0.84, 1.18);
  const panic = clamp(language?.panic || 0, 0, 1);
  const confidence = clamp(language?.confidence || 0, 0, 1);
  return {
    shoulder: 34 * h + confidence * 5,
    chestH: 42 * h,
    waist: 16 * h + panic * 2,
    lean: clamp(language?.lean || 0, -0.26, 0.26),
    breath: clamp(language?.breath || 0, -4, 4),
    wobble: clamp(language?.damageWobble || 0, -6, 6)
  };
}

function drawSilhouette(ctx, color, m) {
  ctx.fillStyle = 'rgba(5,6,11,.9)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-m.shoulder, -22);
  ctx.quadraticCurveTo(-m.shoulder * 0.58, -39, 0, -35);
  ctx.quadraticCurveTo(m.shoulder * 0.58, -39, m.shoulder, -22);
  ctx.quadraticCurveTo(m.waist + 8, 6, m.waist, 32);
  ctx.quadraticCurveTo(0, 43, -m.waist, 32);
  ctx.quadraticCurveTo(-m.waist - 8, 6, -m.shoulder, -22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function drawTorso(ctx, f, color, language = {}) {
  const a = anchor(f);
  const m = metrics(f, language);
  const cx = (a.hip.x + a.chest.x) * 0.5 + m.wobble;
  const cy = (a.hip.y + a.chest.y) * 0.5 + m.breath + 6;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(m.lean);
  drawSilhouette(ctx, color, m);
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-m.shoulder * 0.55, -18);
  ctx.quadraticCurveTo(0, -27, m.shoulder * 0.55, -18);
  ctx.moveTo(-m.waist * 0.8, 14);
  ctx.quadraticCurveTo(0, 21, m.waist * 0.8, 14);
  ctx.stroke();
  ctx.restore();
}
