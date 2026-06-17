// B"H
/** Stores world scene plans before a concrete renderer consumes them. */
export class ScenePlanRegistry {
  constructor() { this.plans = new Map(); }
  set(id, plan) { this.plans.set(id, { id, plan, at:new Date().toISOString() }); return this.get(id); }
  get(id) { return this.plans.get(id) || null; }
  snapshot() { return { plans:this.plans.size, ids:[...this.plans.keys()] }; }
}
export default ScenePlanRegistry;
