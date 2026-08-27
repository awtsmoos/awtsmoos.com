// B"H
// The clock converts time into measured breath.
export function stepClock(last, now = performance.now()) {
  const delta = now - last || 16.67;
  return { now, delta, dt: Math.min(1.5, Math.max(.75, delta / 16.67)) };
}
