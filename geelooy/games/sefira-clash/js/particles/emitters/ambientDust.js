/**
 * B"H — Ambient dust keeps the parchment world breathing. It is tiny and
 * capped, made for mobile: a few sparks, no heavy simulation.
 */
export function addAmbientDust(state) {
  if (state.frame % 9 !== 0 || state.particles.length > 90) return;
  const base = state.map.platforms[0];
  state.particles.push({
    x: base.x + Math.random() * base.w,
    y: base.y - 8 - Math.random() * 40,
    vx: Math.random() * .6 - .3,
    vy: -Math.random() * .35,
    life: 36,
    color: 'rgba(255,232,170,.55)'
  });
}
