/** B"H — screen-space shock, trails, sparks, and combo fire. */
export function drawImpactFX(ctx, f, p, color) {
  const a = f.attack || f.rapidAttack, combo = Math.min(1.6, (f.comboCount || f.rapidJail?.recentHits || 0) / 7);
  if (a) drawTrail(ctx, f, p, color, a, combo);
  if ((f.stun || 0) > 0 || (f.hitstop || 0) > 0) drawShock(ctx, f, p, color, combo);
  if (combo > 0.15 || f.chargeGlow) drawAura(ctx, f, p, color, combo);
}
function drawTrail(ctx, f, p, color, a, combo) {
  const hand = p.face > 0 ? p.rightHand : p.leftHand, foot = p.face > 0 ? p.rightFoot : p.leftFoot;
  const kick = (a.id || '').includes('kick'), q = kick ? foot : hand, len = (kick ? 60 : 48) + combo * 30;
  ctx.save(); ctx.globalAlpha = 0.22 + combo * 0.16; ctx.strokeStyle = color; ctx.lineWidth = 7 + combo * 5; ctx.beginPath();
  ctx.moveTo(q.x - p.face * len, q.y + (kick ? -18 : 8)); ctx.quadraticCurveTo(q.x - p.face * len * 0.35, q.y - 30, q.x, q.y); ctx.stroke();
  ctx.globalAlpha *= 0.55; ctx.lineWidth *= 0.45; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.restore();
}
function drawShock(ctx, f, p, color, combo) {
  const power = Math.min(1.8, ((f.stun || 0) + (f.hitstop || 0) * 2) / 34 + combo);
  ctx.save(); ctx.globalAlpha = 0.18 + power * 0.12; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2 + power * 2;
  for (let i = 0; i < 3 + power * 2; i++) { const a = i * 2.2 + (f.motionClock || 0) * 0.08; ctx.beginPath(); ctx.moveTo(p.chest.x, p.chest.y); ctx.lineTo(p.chest.x + Math.cos(a) * (34 + power * 20), p.chest.y + Math.sin(a) * (28 + power * 18)); ctx.stroke(); }
  ctx.strokeStyle = color; ctx.beginPath(); ctx.ellipse(p.chest.x, p.chest.y, 30 + power * 28, 12 + power * 10, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
function drawAura(ctx, f, p, color, combo) {
  const c = Math.max(combo, f.chargeGlow || 0); ctx.save(); ctx.globalAlpha = 0.08 + c * 0.08; ctx.strokeStyle = color; ctx.lineWidth = 2;
  for (let i = 0; i < 2 + c * 3; i++) { ctx.beginPath(); ctx.ellipse(p.pelvis.x, p.pelvis.y - 28, 34 + i * 10, 72 + i * 8, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
