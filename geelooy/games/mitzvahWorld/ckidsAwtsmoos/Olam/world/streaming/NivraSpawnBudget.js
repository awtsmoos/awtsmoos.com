// B\"H
/** Small spawn budget oracle: never let one herd become one frozen frame. */
export function createNivraSpawnBudget({ perFrame = 2, maxQueued = 256 } = {}) {
  return {
    perFrame: Math.max(1, perFrame),
    maxQueued: Math.max(1, maxQueued),
    canAccept(size) { return size < this.maxQueued; },
    nextBatch(queue) { return queue.splice(0, this.perFrame); }
  };
}
