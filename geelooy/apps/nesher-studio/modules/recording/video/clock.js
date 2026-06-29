/* B"H
Monotonic clock: time climbs one-way so encoded frames do not collide.
*/
export function createMonotonicClock(now = () => performance.now()) {
  const start = now();
  let last = -1;
  return { timestamp(){ const us = Math.max(0, Math.round((now() - start) * 1000)); last = us <= last ? last + 1000 : us; return last; }, get last(){ return last; } };
}
