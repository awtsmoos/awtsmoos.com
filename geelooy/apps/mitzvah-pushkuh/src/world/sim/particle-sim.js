// B"H
// Particle sim is the future worker-side garden of sparks.
export function createParticleSim() {
  let count = 0;
  function emit(n = 1) { count = Math.min(999, count + n); }
  function update(dt = 1) { count = Math.max(0, count - dt); }
  return { emit, update, count: () => count };
}
