// B"H
import { vfsNode } from './node.js';
import { operationResult, splitEntryPath } from './operations.js';
export function localVirtualAdapter(os) {
  const adapter = {
    id:'virtual',
    async list(path = '/') {
      try {
        if (path === '/') return (await os.db.getAllStoreNames()).map(x => vfsNode(`/${cleanName(x)}`, 'folder', { name:cleanName(x) }));
        return (await os.db.getAllKeys(path.replace(/^\//, ''))).map(x => nodeFrom(path, x));
      } catch (error) { if (aliasMissing(error)) return []; throw error; }
    },
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
function nodeFrom(path, raw) {
  const name = cleanName(raw), type = raw?.type === 'directory' ? 'folder' : 'file';
  return vfsNode(`${path}/${name}`, type, typeof raw === 'object' ? { ...raw, name } : { name });
}
function cleanName(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value?.name || value?.title || value?.label || value?.id || 'Untitled';
}
function aliasMissing(error) { return error?.code === 'awtsmoos_alias_not_ready' || /alias is not ready/i.test(error?.message || ''); }
/** B"H: the local adapter now turns missing alias thunder into an empty folder, not a shattered window. */
