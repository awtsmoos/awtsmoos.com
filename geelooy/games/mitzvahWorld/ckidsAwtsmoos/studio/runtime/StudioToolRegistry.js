// B"H
/** @file StudioToolRegistry.js @description Chapter 613: editor tools bow to one runtime, not separate islands. */
export class StudioToolRegistry {
  constructor(runtime) { this.runtime = runtime; this.tools = new Map(); this.history = []; }
  register(tool = {}) { const id = String(tool.id || tool.name); const next = { category:"general", shortcut:null, ...tool, id }; this.tools.set(id, next); return next; }
  registerMany(tools = []) { return tools.map(tool => this.register(tool)); }
  list(category = null) { const all = [...this.tools.values()]; return category ? all.filter(tool => tool.category === category) : all; }
  use(id, payload = {}) { const tool = this.tools.get(String(id)); this.history.push({ id, at:Date.now(), ok:Boolean(tool) }); return tool?.apply ? tool.apply({ runtime:this.runtime, payload }) : { ok:Boolean(tool), tool, payload }; }
  snapshot() { return { count:this.tools.size, categories:[...new Set(this.list().map(t => t.category))], tools:this.list().map(({ apply, ...tool }) => tool) }; }
}
export function createStudioToolRegistry(runtime) { return new StudioToolRegistry(runtime); }
export default createStudioToolRegistry;
