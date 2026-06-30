// B"H

/** Burst sparks from a revealed object, capped by the performance governor. */
export function addBurst(world, object) {
  const quality = world.performance?.scale ?? 1;
  const base = world.save.perf === 'low' ? 8 : world.save.perf === 'high' ? 30 : 17;
  for (let i = 0; i < Math.ceil(base * quality); i += 1) world.particles.push(makeParticle(object));
}

/** Floating text is short-lived evidence that the spark was gathered. */
export function addText(world, x, y, z, text) {
  if ((world.performance?.scale ?? 1) > 0.5) world.floaters.push({ x, y, z, text, life: 1.05 });
}

function makeParticle(object) {
  return {
    x: object.x,
    y: object.y,
    z: object.z + object.h * 0.55,
    vx: (Math.random() - 0.5) * 350,
    vy: (Math.random() - 0.5) * 350,
    vz: 130 + Math.random() * 250,
    life: 0.7 + Math.random() * 0.85,
    r: 2.8 + Math.random() * 6.2,
    hue: object.hue
  };
}
