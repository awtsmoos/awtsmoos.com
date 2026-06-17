// B"H
/** Tracks episodic universe unlocks, the seed of the Subscribe Universe system. */
export class SubscriptionArcRuntime {
  constructor(arcs = []) { this.arcs = arcs; this.completed = new Set(); }
  current() { return this.arcs.find(a => !this.completed.has(a.id)) || null; }
  complete(id) { this.completed.add(id); return { completed:id, next:this.current()?.id || null }; }
  snapshot() { return { arcs:this.arcs.length, completed:[...this.completed], current:this.current()?.id || null }; }
}
export default SubscriptionArcRuntime;
