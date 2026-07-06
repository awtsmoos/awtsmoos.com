// B"H
/** @file RuntimeActionRegistry.js @description Chapter 611: all verbs enter one gate before touching the world. */
const GLOBAL_KEY = "__MITZVAH_WORLD_ACTION_REGISTRY__";
function normalize(action = {}) { return { cooldownMs:0, stamina:0, tags:[], ...action, id:String(action.id || action.name || "action") }; }
export class RuntimeActionRegistry {
  constructor() { this.actions = new Map(); this.history = []; }
  register(action = {}) { const next = normalize(action); this.actions.set(next.id, next); return next; }
  registerMany(actions = []) { return actions.map(action => this.register(action)); }
  get(id) { return this.actions.get(String(id)) || null; }
  list(tag = null) { const all = [...this.actions.values()]; return tag ? all.filter(action => action.tags?.includes(tag)) : all; }
  canRun(id, context = {}) { const action = this.get(id); return { ok:Boolean(action), action, reason:action ? "ready" : "missing-action", context }; }
  async run(id, context = {}) { const gate = this.canRun(id, context); this.history.push({ id, ok:gate.ok, at:Date.now() }); if (!gate.ok) return gate; return gate.action.run ? await gate.action.run(context) : gate; }
  snapshot() { return { count:this.actions.size, actions:this.list().map(({ run, ...action }) => action), history:this.history.slice(-40) }; }
}
export function getRuntimeActionRegistry() { globalThis[GLOBAL_KEY] ||= new RuntimeActionRegistry(); return globalThis[GLOBAL_KEY]; }
export default getRuntimeActionRegistry;
