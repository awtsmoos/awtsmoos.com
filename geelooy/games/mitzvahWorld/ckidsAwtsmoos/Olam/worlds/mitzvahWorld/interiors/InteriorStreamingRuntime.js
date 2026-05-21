/**
 * B"H
 * Chapter 22: Rooms Rose From Hidden Breath.
 */

export class InteriorStreamingRuntime {
  constructor(registry = {}) {
    this.registry = registry;
    this.loaded = new Map();
  }

  registerInterior(id, factory) {
    this.registry[id] = factory;
    return id;
  }

  async enter(id, context = {}) {
    const factory = this.registry[id];
    if (!factory) throw new Error(`Unknown interior: ${id}`);

    if (!this.loaded.has(id)) {
      const room = await factory(context);
      this.loaded.set(id, { id, room, visits: 0 });
    }

    const record = this.loaded.get(id);
    record.visits += 1;
    return { id, room: record.room, visits: record.visits };
  }

  leave(id) {
    return { id, stillLoaded: this.loaded.has(id) };
  }

  snapshot() {
    return [...this.loaded.values()].map(({ id, visits }) => ({ id, visits }));
  }
}

export default InteriorStreamingRuntime;
