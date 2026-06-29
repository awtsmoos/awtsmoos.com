// B"H
const DEFAULT_MOUNTS = Object.freeze([
  { id:"mount:virtual", prefix:"/", adapterId:"virtual", title:"Virtual Home" },
  { id:"mount:tunnels", prefix:"awtsmoos://tunnels", adapterId:"tunnel", title:"Tunnel Drives" },
  { id:"mount:previews", prefix:"awtsmoos://previews", adapterId:"preview", title:"Preview Artifacts" }
]);

export class VfsRegistry {
  constructor(mounts = DEFAULT_MOUNTS) { this.adapters = new Map(); this.mountTable = mounts.map(mountRecord); this.sortMounts(); }
  register(adapter) { this.adapters.set(adapter.id, adapter); return adapter; }
  mount(input) { const record = mountRecord(input); this.unmount(record.id); this.mountTable.push(record); this.sortMounts(); return record; }
  unmount(idOrPrefix) { const before = this.mountTable.length; this.mountTable = this.mountTable.filter(m => m.id !== idOrPrefix && m.prefix !== idOrPrefix); return before !== this.mountTable.length; }
  mounts() { return this.mountTable.map(m => ({ ...m, data:{ ...m.data }, permissions:{ ...m.permissions } })); }
  sortMounts() { this.mountTable.sort((a, b) => b.prefix.length - a.prefix.length); }
  resolve(path = "/") { const text = String(path || "/"); const mount = this.mountTable.find(m => matchesMount(text, m)) || this.mountTable.find(m => m.prefix === "/"); return { mount, adapter:mount ? this.adapters.get(mount.adapterId) : null, path:text }; }
  adapterFor(path = "/") { return this.resolve(path).adapter; }
  async list(path) { return await this.adapterFor(path)?.list(path); }
  async read(path) { return await this.adapterFor(path)?.read(path); }
  async stat(path) { return await this.adapterFor(path)?.stat(path); }
}

function mountRecord(input = {}) { const prefix = input.prefix || input.path || "/"; return { id:input.id || `mount:${String(prefix).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root"}`, prefix:String(prefix).replace(/\/$/, "") || "/", adapterId:input.adapterId || input.adapter || "virtual", title:input.title || input.name || String(prefix), permissions:input.permissions || {}, data:{ ...(input.data || {}) } }; }
function matchesMount(path, mount) { if (mount.prefix === "/") return path.startsWith("/") || !path.includes("://"); return path === mount.prefix || path.startsWith(`${mount.prefix}/`); }
export function makeVfsRegistry() { return new VfsRegistry(); }
/** B"H: the VFS now walks by sorted mounts, so every path seeks its longest rooted vessel before falling home. */
