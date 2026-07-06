// B"H
/** @file RuntimeEntityRegistry.js @description Chapter 610: every actor, projectile, item, and herd receives one searchable address. */
const GLOBAL_KEY = "__MITZVAH_WORLD_ENTITY_REGISTRY__";
function idOf(input = {}) { return String(input.id || input.name || `entity_${Date.now()}_${Math.random().toString(36).slice(2)}`); }
function clone(value) { return JSON.parse(JSON.stringify(value ?? null)); }
function groupsFor(entity = {}) { return [...new Set([entity.kind, ...(entity.tags || [])].filter(Boolean))]; }
export class RuntimeEntityRegistry {
  constructor() { this.entities = new Map(); this.groups = new Map(); this.events = []; }
  upsert(entity = {}) {
    const id = idOf(entity), now = Date.now(), old = this.entities.get(id) || { id, createdAt:now };
    const next = { ...old, ...entity, id, updatedAt:now };
    this.entities.set(id, next); this.reindex(); this.record("upsert", id); return next;
  }
  reindex() { this.groups = new Map(); for (const entity of this.entities.values()) for (const group of groupsFor(entity)) { if (!this.groups.has(group)) this.groups.set(group, new Set()); this.groups.get(group).add(entity.id); } }
  get(id) { return this.entities.get(String(id)) || null; }
  list(group = null) { const ids = group ? [...(this.groups.get(group) || [])] : [...this.entities.keys()]; return ids.map(id => this.get(id)).filter(Boolean); }
  remove(id) { const key = String(id), ok = this.entities.delete(key); this.reindex(); this.record("remove", key); return ok; }
  record(type, id) { this.events.push({ type, id, at:Date.now() }); this.events = this.events.slice(-300); }
  snapshot() { return { count:this.entities.size, groups:Object.fromEntries([...this.groups].map(([k,v]) => [k, v.size])), entities:this.list().map(clone) }; }
}
export function getRuntimeEntityRegistry() { globalThis[GLOBAL_KEY] ||= new RuntimeEntityRegistry(); return globalThis[GLOBAL_KEY]; }
export default getRuntimeEntityRegistry;
