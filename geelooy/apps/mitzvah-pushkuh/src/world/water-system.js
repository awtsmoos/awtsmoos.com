// B"H
// Water remembers touch for a while, then returns to silence.
export function createWaterSystem() {
  let ripples = [];
  function disturb(x, y, power = 1) { ripples.push({ x, y, r: 2, life: 1, power }); ripples = ripples.slice(-18); }
  function update(dt = 1) { ripples.forEach(r => { r.r += 2.2 * dt * r.power; r.life -= .012 * dt; }); ripples = ripples.filter(r => r.life > 0); }
  function draw(ctx, h, q) {
    if (q.emergency) return; ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "#8feaff55";
    for (let i = 0; i < ripples.length; i++) { const r = ripples[i], y = Math.max(h * .66, r.y); ctx.globalAlpha = r.life * .32; ctx.strokeRect(r.x - r.r, y - r.r * .16, r.r * 2, r.r * .32); } ctx.restore();
  }
  return { disturb, update, draw };
}
