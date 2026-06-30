// B"H
/**
 * A trigger speaks on crossing, not on every breath inside its border.
 */
export class CollisionTriggerRuntime {
  constructor(world) {
    this.world = world;
    this.activeByActor = new Map();
    this.consumedOnce = new Set();
  }

  update(actorId, point, radius = 0.55) {
    const id = String(actorId || "player");
    const before = this.activeByActor.get(id) || new Set();
    const inside = new Set();
    const events = [];
    for (const body of this.world.queryCircle(point, radius, body => body.trigger)) {
      if (body.once && this.consumedOnce.has(`${id}:${body.id}`)) continue;
      inside.add(body.id);
      if (!before.has(body.id)) {
        events.push({ type:"triggerEnter", actorId:id, triggerId:body.id, kind:body.kind, body });
        if (body.once) this.consumedOnce.add(`${id}:${body.id}`);
      }
    }
    for (const triggerId of before) {
      if (!inside.has(triggerId)) events.push({ type:"triggerExit", actorId:id, triggerId });
    }
    this.activeByActor.set(id, inside);
    return events;
  }

  reset(actorId = null) {
    if (actorId) this.activeByActor.delete(String(actorId));
    else this.activeByActor.clear();
  }
}

export default CollisionTriggerRuntime;
