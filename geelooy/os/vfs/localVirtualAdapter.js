// B"H
import { vfsNode } from './node.js';
import { operationResult, splitEntryPath } from './operations.js';
export function localVirtualAdapter(os) {
  const adapter = {
    id:'virtual',
    async list(path = '/') { if (path === '/') return (await os.db.getAllStoreNames()).map(x => vfsNode(`/${x}`, 'folder', { name:x })); return (await os.db.getAllKeys(path.replace(/^\//, ''))).map(x => vfsNode(`${path}/${x.name || x}`, x.type === 'directory' ? 'folder' : 'file', x)); },
    async read(path) { const entry = splitEntryPath(path); return { ok:true, content:await os.db.Laynin(entry.parent, entry.name) }; },
    async stat(path) { return { ok:true, node:vfsNode(path, 'file') }; },
    async write(path, { content = '' } = {}) { const entry = splitEntryPath(path); await os.db.Koysayv(entry.parent, entry.name, content, 'file'); return operationResult('write', path); },
    async mkdir(path) { const entry = splitEntryPath(path); await os.db.Koysayv(entry.parent, entry.name, null, 'directory'); return operationResult('mkdir', path, { type:'folder' }); },
    async remove(path) { const entry = splitEntryPath(path); await os.db.delete?.(entry.parent, entry.name); return operationResult('remove', path); },
    async copy(path, { from } = {}) { const got = await adapter.read(from); await adapter.write(path, { content:got.content }); return operationResult('copy', path, { from }); },
    async move(path, { from } = {}) { await adapter.copy(path, { from }); await adapter.remove(from); return operationResult('move', path, { from }); }
  };
  return adapter;
}
/** B"H: DB use remains only inside the local VFS adapter, the single backend gate. */
