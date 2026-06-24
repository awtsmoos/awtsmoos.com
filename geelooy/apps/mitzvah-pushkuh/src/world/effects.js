// B"H
// Sparks are not decoration here; they are the memory of impact.
export function createEffects() {
  let motes = [], waves = [], trail = [];
  function burst(x, y, c, power = 1) {
    for (let i = 0; i < 36 * power; i++) {
      const a = Math.random() * 7, v = 1 + Math.random() * 7 * power;
      motes.push({ x, y, c, r: 1.4 + Math.random() * 4.8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .75 + Math.random() * .5 });
    }
  }
  function shock(x, y, c, power = 1) { waves.push({ x, y, c, life: 1, power }); burst(x, y, c, 1.25 * power); }
  function trace(point) { trail.unshift({ ...point, life: 1 }); trail = trail.slice(0, 22); }
  function move() { motes.forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= .992; p.vy = p.vy * .992 + .023; }); }
  function draw(ctx) { trail.forEach(p => drawTrail(ctx, p)); motes.forEach(p => drawMote(ctx, p)); waves.forEach(w => drawWave(ctx, w)); cleanup(); }
  function cleanup() { motes = motes.filter(p => (p.life -= .018) > 0); waves = waves.filter(w => (w.life -= .022) > 0); trail = trail.filter(p => (p.life -= .035) > 0); }
  return { burst, shock, trace, move, draw };
}
function drawMote(ctx, p) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = p.life; ctx.shadowBlur = 16; ctx.shadowColor = p.c; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.5 + p.life), 0, 7); ctx.fill(); ctx.restore(); }
function drawWave(ctx, w) { ctx.save(); ctx.globalAlpha = w.life; ctx.strokeStyle = w.c; ctx.lineWidth = 2 + w.power * 2; ctx.shadowBlur = 28; ctx.shadowColor = w.c; ctx.beginPath(); ctx.arc(w.x, w.y, (1 - w.life) * 190 * w.power, 0, 7); ctx.stroke(); ctx.restore(); }
function drawTrail(ctx, p) { ctx.save(); ctx.globalAlpha = p.life * .48; ctx.fillStyle = "#8feaff"; ctx.shadowBlur = 20; ctx.shadowColor = "#8feaff"; ctx.beginPath(); ctx.arc(p.x, p.y, 8 * (p.life + .25), 0, 7); ctx.fill(); ctx.restore(); }
