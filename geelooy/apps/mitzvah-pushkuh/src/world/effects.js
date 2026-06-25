// B"H
// Effects now borrow cached light instead of drawing storms.
export function createEffects(quality = {}) {
  let motes = [], waves = [], trail = [];
  const moteCap = quality.moteCap || 18, trailCap = quality.trailCap || 4;
  function burst(x, y, c, power = 1) {
    const count = Math.min(Math.floor(8 * power), Math.max(0, moteCap - motes.length));
    for (let i = 0; i < count; i++) { const a = Math.random() * 7, v = 1 + Math.random() * 3; motes.push({ x, y, c, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .65 }); }
  }
  function shock(x, y, c, power = 1) { waves.push({ x, y, c, life: 1, power }); waves = waves.slice(-3); burst(x, y, c, power); }
  function trace(point) { trail.unshift({ ...point, life: 1 }); trail = trail.slice(0, trailCap); }
  function move(dt = 1) { motes.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= .035; }); }
  function draw(ctx, tools = {}) { ctx.save(); ctx.globalCompositeOperation = "lighter"; trail.forEach(p => dot(ctx, p, tools.atlas?.burst, 16)); motes.forEach(p => dot(ctx, p, tools.atlas?.burst, 10)); waves.forEach(w => box(ctx, w)); ctx.restore(); cleanup(); }
  function cleanup() { motes = motes.filter(p => p.life > 0); waves = waves.filter(w => (w.life -= .04) > 0); trail = trail.filter(p => (p.life -= .05) > 0); }
  return { burst, shock, trace, move, draw };
}
function dot(ctx, p, img, s) { ctx.globalAlpha = p.life; img ? ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s) : ctx.fillRect(p.x, p.y, 3, 3); }
function box(ctx, w) { const r = (1 - w.life) * 80 * w.power; ctx.globalAlpha = w.life * .45; ctx.strokeStyle = w.c; ctx.strokeRect(w.x - r, w.y - r, r * 2, r * 2); }
