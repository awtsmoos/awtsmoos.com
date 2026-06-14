/**
 * B"H
 * Clean hero aura only.
 *
 * Chapter 214: the pixel storm is cut away. Hits and charge get only a soft
 * readable ring so the body remains visible on mobile.
 */
export function drawHeroPoseAura(ctx, f, p, color) {
  const active = !!f.attack || !!f.rapidAttack || !!f.chargeGlow;
  if (!active) return;
  ctx.save();
  ctx.globalAlpha = f.attack?.fullCharge ? 0.18 : 0.08;
  ctx.strokeStyle = color;
  ctx.lineWidth = f.attack?.fullCharge ? 3 : 2;
  ctx.beginPath();
  ctx.ellipse(p.chest.x, p.chest.y + 42 * (p.scale || 1), 42 * (p.scale || 1), 58 * (p.scale || 1), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
