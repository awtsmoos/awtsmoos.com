/* B"H
Backpressure controller: when the encoder is full, the frame river narrows before it breaks.
*/
export function createBackpressureController({ maxQueue = 2, softQueue = 1 } = {}) {
  return { maxQueue, softQueue, skipped:0, accepted:0 };
}
export function shouldAcceptFrame(controller, queueDepth, force = false) {
  if (force || queueDepth <= controller.maxQueue) { controller.accepted++; return true; }
  controller.skipped++;
  return false;
}
export function queuePressure(controller, queueDepth) {
  if (queueDepth > controller.maxQueue) return 'critical';
  if (queueDepth > controller.softQueue) return 'warm';
  return 'clear';
}
