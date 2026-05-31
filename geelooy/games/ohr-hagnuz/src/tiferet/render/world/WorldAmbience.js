/**
 * B"H
 * @module WorldAmbience
 *
 * Chapter 48: Dawn, noon, dusk, and night began cycling through the leaves.
 * The Awtsmoos has no body and no form; ambience is not scenery, it is the
 * moving breath between every generated tile, a soft proof that the world is
 * alive even when the player stands still.
 */
const PHASES = [
  { at: 0, tint: 'rgba(13,23,55,.28)', glow: 'rgba(150,190,255,.2)' },
  { at: .25, tint: 'rgba(255,229,148,.08)', glow: 'rgba(255,236,152,.22)' },
  { at: .55, tint: 'rgba(255,128,72,.13)', glow: 'rgba(255,177,90,.24)' },
  { at: .8, tint: 'rgba(17,9,52,.24)', glow: 'rgba(170,120,255,.22)' }
];

export const drawWorldAmbience = (ctx, tick = performance.now()) => {
  const { width: w, height: h } = ctx.canvas;
  const phase = (tick / 36000) % 1;
  ctx.save();
  drawTimeTint(ctx, w, h, phase);
  drawMotes(ctx, w, h, tick, phase);
  drawEdgeLanterns(ctx, w, h, tick);
  drawVignette(ctx, w, h);
  ctx.restore();
};

const currentPhase = phase => PHASES.reduce((best, item) => Math.abs(item.at - phase) < Math.abs(best.at - phase) ? item : best, PHASES[0]);

const drawTimeTint = (ctx, w, h, phase) => {
  const now = currentPhase(phase);
  ctx.fillStyle = now.tint;
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * .45, h * .28, 0, w * .45, h * .28, h * .55);
  g.addColorStop(0, now.glow);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const drawMotes = (ctx, w, h, tick, phase) => {
  const night = phase < .18 || phase > .78;
  ctx.globalAlpha = night ? .8 : .5;
  for (let i = 0; i < 36; i += 1) {
    const x = ((i * 83 + tick * .014 * (i % 3 + 1)) % (w + 80)) - 40;
    const y = ((i * 137 + tick * .008 * (i % 4 + 1)) % (h + 80)) - 40;
    const r = 1.2 + (i % 5) * .32;
    ctx.fillStyle = i % 3 ? 'rgba(255,229,116,.52)' : 'rgba(145,230,255,.32)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

const drawEdgeLanterns = (ctx, w, h, tick) => {
  const pulse = .18 + Math.sin(tick / 700) * .06;
  [['left', w * .1, h * .2], ['right', w * .87, h * .36], ['low', w * .66, h * .78]].forEach(([, x, y]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, h * .12);
    g.addColorStop(0, `rgba(255,219,112,${pulse})`);
    g.addColorStop(1, 'rgba(255,219,112,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - h * .12, y - h * .12, h * .24, h * .24);
  });
};

const drawVignette = (ctx, w, h) => {
  const g = ctx.createRadialGradient(w * .5, h * .42, h * .12, w * .5, h * .5, h * .75);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(.72, 'rgba(0,0,0,.08)');
  g.addColorStop(1, 'rgba(0,0,0,.38)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};
