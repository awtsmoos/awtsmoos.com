// B"H
// Sparks burst with restraint: every mote knows its budget.
export function createEffects(quality = {}) {
  let motes = [], waves = [], trail = [];
  const moteCap = quality.moteCap || 180, trailCap = quality.trailCap || 16;
  function burst(x, y, c, power = 1) {
    const room = Math.max(0, moteCap - motes.length), count = Math.min(Math.floor(24 * power), room);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * 7, v = 1 + Math.random() * 4.8 * power;
      motes.push({ x, y, c, r: 1 + Math.random() * 3.5, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .7 + Math.random() * .4 });
    }
  }
  function shock(x, y, c, power = 1) { waves.push({ x, y, c, life: 1, power }); waves = waves.slice(-7); burst(x, y, c, 1.05 * power); }
  function trace(point) { trail.unshift({ ...point, life: 1 }); trail = trail.slice(0, trailCap); }
  function move(dt = 1) { motes.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .99; p.vy = p.vy * .99 + .02 * dt; }); }
  function draw(ctx) { trail.forEach(p => drawTrail(ctx, p)); motes.forEach(p => drawMote(ctx, p)); waves.forEach(w => drawWave(ctx, w)); cleanup(); }
  function cleanup() { motes = motes.filter(p => (p.life -= .02) > 0); waves = waves.filter(w => (w.life -= .026) > 0); trail = trail.filter(p => (p.life -= .04) > 0); }
  return { burst, shock, trace, move, draw };
}
function drawMote(ctx, p) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = p.life; ctx.shadowBlur = 11; ctx.shadowColor = p.c; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r, p.r); ctx.restore(); }
function drawWave(ctx, w) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = w.life; ctx.strokeStyle = w.c; ctx.lineWidth = 1.5 + w.power * 1.7; ctx.shadowBlur = 18; ctx.shadowColor = w.c; ctx.beginPath(); ctx.arc(w.x, w.y, (1 - w.life) * 160 * w.power, 0, 7); ctx.stroke(); ctx.restore(); }
function drawTrail(ctx, p) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = p.life * .36; ctx.fillStyle = "#8feaff"; ctx.shadowBlur = 16; ctx.shadowColor = "#8feaff"; ctx.beginPath(); ctx.arc(p.x, p.y, 6 * (p.life + .25), 0, 7); ctx.fill(); ctx.restore(); }
