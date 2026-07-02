// B"H
import { defaultMounts, mount as shapeMount } from "./mounts.js";
import { assertMountPermission, canUseMount } from "./permissions.js";
import { callAdapter } from "./operations.js";
import { normalizeProviderPath } from "../providers/providerPath.js";

export class VfsRegistry {
  constructor({ mounts = defaultMounts(), onMutation = () => {} } = {}) { this.adapters = new Map(); this.mountTable = mounts.map(shapeMount); this.onMutation = onMutation; }
  register(adapter) { this.adapters.set(adapter.id, adapter); return adapter; }
  mount(input) { const shaped = shapeMount(input); this.unmount(shaped.id, { silent:true }); this.mountTable.push(shaped); this.emit("mount", shaped.prefix, { ok:true, mount:shaped }); return shaped; }
  unmount(id, options = {}) { const old = this.mountTable.find(m => m.id === id); this.mountTable = this.mountTable.filter(m => m.id !== id); if (old && !options.silent) this.emit("unmount", old.prefix, { ok:true, mount:old }); return !!old; }
  mounts() { return this.mountTable.map(m => ({ ...m, permissions:{ ...(m.permissions || {}) } })); }
  resolve(path = "/") { const clean = normalizeProviderPath(path); const mount = this.bestMount(clean); return { mount, adapter:this.adapters.get(mount?.adapterId), path:clean, provider:mount?.provider || "virtual" }; }
  adapterFor(path = "/", action = "read", context = {}) { const { mount, adapter } = this.resolve(path); assertMountPermission(mount, action, context); return adapter; }
  guard(path, action, context = {}) { return assertMountPermission(this.bestMount(path), action, context); }
  can(path, action = "read", context = {}) { return canUseMount(this.bestMount(path), action, context); }
  async list(path = "/", context = {}) { const r = this.resolve(path); return await callAdapter(this.adapterFor(r.path, "list", context), "list", r.path); }
  async read(path, context = {}) { const r = this.resolve(path); return await callAdapter(this.adapterFor(r.path, "read", context), "read", r.path); }
  async stat(path, context = {}) { const r = this.resolve(path); return await callAdapter(this.adapterFor(r.path, "read", context), "stat", r.path); }
  async write(path, content = "", context = {}) { const r = this.resolve(path); const result = await callAdapter(this.adapterFor(r.path, "write", context), "write", r.path, { content }); return this.emit("write", r.path, result, context); }
  async mkdir(path, context = {}) { const r = this.resolve(path); const result = await callAdapter(this.adapterFor(r.path, "write", context), "mkdir", r.path); return this.emit("mkdir", r.path, result, context); }
  async remove(path, context = {}) { const r = this.resolve(path); const result = await callAdapter(this.adapterFor(r.path, "delete", context), "remove", r.path); return this.emit("remove", r.path, result, context); }
  async copy(from, to, context = {}) { this.guard(from, "read", context); const r = this.resolve(to); const result = await callAdapter(this.adapterFor(r.path, "write", context), "copy", r.path, { from:normalizeProviderPath(from) }); return this.emit("copy", r.path, result, { ...context, from }); }
  async move(from, to, context = {}) { this.guard(from, "delete", context); const r = this.resolve(to); const result = await callAdapter(this.adapterFor(r.path, "write", context), "move", r.path, { from:normalizeProviderPath(from) }); return this.emit("move", r.path, result, { ...context, from }); }
  bestMount(path) { const value = normalizeProviderPath(path); return [...this.mountTable].sort((a,b) => b.prefix.length - a.prefix.length).find(m => matches(value, m.prefix)) || this.mountTable[0]; }
  emit(action, path, result = {}, context = {}) { const event = { action, path, provider:this.bestMount(path)?.provider || "virtual", result, context, at:new Date().toISOString() }; this.onMutation(event); return result; }
}

function matches(path, prefix) { if (prefix === "/") return path.startsWith("/") && !path.startsWith("awtsmoos://"); return path === prefix || path.startsWith(`${prefix}/`); }
export function makeVfsRegistry(options = {}) { return new VfsRegistry(options); }
/** B"H: registry resolves provider paths; adapters alone know the machinery. */
