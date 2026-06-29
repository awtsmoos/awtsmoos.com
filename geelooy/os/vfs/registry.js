// B"H
import { DEFAULT_MOUNTS, cloneMount, findMount, mountRecord, sortMounts } from "./mounts.js";

export class VfsRegistry {
  constructor(mounts = DEFAULT_MOUNTS) { this.adapters = new Map(); this.mountTable = sortMounts(mounts.map(mountRecord)); }
  register(adapter) { this.adapters.set(adapter.id, adapter); return adapter; }
  mount(input) { const record = mountRecord(input); this.unmount(record.id); this.mountTable.push(record); sortMounts(this.mountTable); return cloneMount(record); }
  unmount(idOrPrefix) { const before = this.mountTable.length; this.mountTable = this.mountTable.filter(m => m.id !== idOrPrefix && m.prefix !== idOrPrefix); return before !== this.mountTable.length; }
  mounts() { return this.mountTable.map(cloneMount); }
  resolve(path = "/") { const mount = findMount(this.mountTable, path); return { mount:mount ? cloneMount(mount) : null, adapter:mount ? this.adapters.get(mount.adapterId) : null, path:String(path || "/") }; }
  adapterFor(path = "/") { return this.resolve(path).adapter; }
  async list(path) { return await this.adapterFor(path)?.list(path); }
  async read(path) { return await this.adapterFor(path)?.read(path); }
  async stat(path) { return await this.adapterFor(path)?.stat(path); }
}

export function makeVfsRegistry() { return new VfsRegistry(); }
/** B"H: the registry now delegates mount truth to the mount engine. */
