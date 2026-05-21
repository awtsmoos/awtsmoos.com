/**
 * B"H
 * @file InteriorPortalRuntime.js
 *
 * Chapter 27: The Door Became A World Behind The World.
 *
 * The Awtsmoos folds a street into a room without losing either. This tiny
 * runtime stores the outside place, enters an interior id, restores the player
 * on exit, and keeps room state save-safe for future streaming.
 */

export class InteriorPortalRuntime {
  constructor() {
    this.active = null;
    this.rooms = new Map();
  }

  registerRoom(room) {
    if (!room?.id) throw new Error('Interior room id is required.');
    this.rooms.set(room.id, { ...room, state: { ...(room.state || {}) } });
    return this.rooms.get(room.id);
  }

  enterInterior({ roomId, fromMapId, playerPosition }) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error(`Unknown interior room: ${roomId}`);
    this.active = {
      roomId,
      fromMapId,
      playerPosition: { ...(playerPosition || {}) }
    };
    room.state.visited = true;
    return { active: { ...this.active }, room: { ...room, state: { ...room.state } } };
  }

  exitInterior() {
    const ended = this.active ? { ...this.active } : null;
    this.active = null;
    return ended;
  }

  snapshot() {
    return {
      active: this.active ? { ...this.active } : null,
      rooms: [...this.rooms.values()].map(room => ({ ...room, state: { ...room.state } }))
    };
  }
}

export default InteriorPortalRuntime;
