/**
 * B"H
 * Hero front effects.
 *
 * Chapter 185: trails and aura remain light so the body stays king.
 */
export function drawHeroPoseAura(ctx, f, p, color) {
  if (!f.chargeGlow && !f.attack && !f.rapidAttack) return;
  ctx.save();
  ctx.globalAlpha = f.attack?.fullCharge ? 0.28 : 0.14;
  ctx.strokeStyle = color;
  ctx.lineWidth = f.attack?.fullCharge ? 5 : 3;
  ctx.beginPath();
  ctx.ellipse(p.chest.x, p.chest.y + 38, 48, 72, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
