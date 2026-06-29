// B"H
import { defaultMounts, mount as shapeMount } from './mounts.js';
import { assertMountPermission, canUseMount } from './permissions.js';
import { callAdapter } from './operations.js';
export class VfsRegistry {
  constructor({ mounts = defaultMounts(), onMutation = () => {} } = {}) { this.adapters = new Map(); this.mountTable = mounts.map(shapeMount); this.onMutation = onMutation; }
  register(adapter) { this.adapters.set(adapter.id, adapter); return adapter; }
  mount(input) { const shaped = shapeMount(input); this.unmount(shaped.id, { silent:true }); this.mountTable.push(shaped); this.emit('mount', shaped.prefix, { ok:true, mount:shaped }); return shaped; }
  unmount(id, options = {}) { const old = this.mountTable.find(m => m.id === id); this.mountTable = this.mountTable.filter(m => m.id !== id); if (old && !options.silent) this.emit('unmount', old.prefix, { ok:true, mount:old }); return !!old; }
  mounts() { return this.mountTable.map(m => ({ ...m, permissions:{ ...(m.permissions || {}) } })); }
  resolve(path = '/') { const mount = this.bestMount(path); return { mount, adapter:this.adapters.get(mount?.adapterId), path }; }
  adapterFor(path = '/', action = 'read', context = {}) { const { mount, adapter } = this.resolve(path); assertMountPermission(mount, action, context); return adapter; }
  guard(path, action, context = {}) { return assertMountPermission(this.bestMount(path), action, context); }
  can(path, action = 'read', context = {}) { return canUseMount(this.bestMount(path), action, context); }
  async list(path = '/', context = {}) { return await callAdapter(this.adapterFor(path, 'list', context), 'list', path); }
  async read(path, context = {}) { return await callAdapter(this.adapterFor(path, 'read', context), 'read', path); }
  async stat(path, context = {}) { return await callAdapter(this.adapterFor(path, 'read', context), 'stat', path); }
  async write(path, content = '', context = {}) { const result = await callAdapter(this.adapterFor(path, 'write', context), 'write', path, { content }); return this.emit('write', path, result, context); }
  async mkdir(path, context = {}) { const result = await callAdapter(this.adapterFor(path, 'write', context), 'mkdir', path); return this.emit('mkdir', path, result, context); }
  async remove(path, context = {}) { const result = await callAdapter(this.adapterFor(path, 'delete', context), 'remove', path); return this.emit('remove', path, result, context); }
  async copy(from, to, context = {}) { this.guard(from, 'read', context); const result = await callAdapter(this.adapterFor(to, 'write', context), 'copy', to, { from }); return this.emit('copy', to, result, { ...context, from }); }
  async move(from, to, context = {}) { this.guard(from, 'delete', context); const result = await callAdapter(this.adapterFor(to, 'write', context), 'move', to, { from }); return this.emit('move', to, result, { ...context, from }); }
  bestMount(path) { const value = String(path || '/'); return [...this.mountTable].sort((a,b) => b.prefix.length - a.prefix.length).find(m => matches(value, m.prefix)) || this.mountTable[0]; }
  emit(action, path, result = {}, context = {}) { const event = { action, path, result, context, at:new Date().toISOString() }; this.onMutation(event); return result; }
}
function matches(path, prefix) { if (prefix === '/') return path.startsWith('/') && !path.startsWith('awtsmoos://'); return path === prefix || path.startsWith(`${prefix}/`); }
export function makeVfsRegistry(options = {}) { return new VfsRegistry(options); }
/** B"H: mount and unmount now speak into the same mutation/history river. */
