// B"H
import { EventBus } from './EventBus.js';

/** AwtsRuntime owns entities, systems, time, and worker-serializable state. */
export class AwtsRuntime {
  constructor() { this.events = new EventBus(); this.entities = []; this.systems = []; this.time = 0; }
  add(entity) { entity.runtime = this; this.entities.push(entity); this.events.emit('entity:add', entity); return entity; }
  addSystem(system) { system.runtime = this; this.systems.push(system); system.start?.(this); return system; }
  step(dt) { this.time += dt; for (const e of this.entities) e.heesHawvoos?.(dt, this); for (const s of this.systems) s.update?.(dt, this); }
  snapshot(extra = {}) { return { time: this.time, entities: this.entities.map((e) => e.toRenderState()), ...extra }; }
}
