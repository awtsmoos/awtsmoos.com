/**
 * B"H
 * Chapter 26: The Stair Bent Upward Like Fire.
 */

export class StairTraversalRuntime {
  constructor(stairs = {}) {
    this.stairs = stairs;
  }

  register(stairId, from, to) {
    this.stairs[stairId] = { stairId, from, to };
    return this.stairs[stairId];
  }

  traverse(stairId, actor = {}) {
    const stair = this.stairs[stairId];
    if (!stair) throw new Error(`Unknown stair: ${stairId}`);

    actor.roomId = actor.roomId === stair.from ? stair.to : stair.from;
    return { actorId: actor.id || null, roomId: actor.roomId, stairId };
  }
}

export default StairTraversalRuntime;
