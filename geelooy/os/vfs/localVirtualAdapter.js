// B"H
import { vfsNode } from './node.js';
import { operationResult, splitEntryPath } from './operations.js';

export function localVirtualAdapter(os) {
  const adapter = {
    id:'virtual',
    async list(path = '/') {
      try {
        if (path === '/') return [...await rootStores(os), ...driveNodes(os)];
        return (await os.db.getAllKeys(path.replace(/^\//, ''))).map(x => nodeFrom(path, x));
      } catch (error) { if (aliasMissing(error)) return driveNodes(os); throw error; }
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

async function rootStores(os) { return (await os.db.getAllStoreNames()).map(x => vfsNode(`/${cleanName(x)}`, 'folder', { name:cleanName(x), kind:'virtual' })); }
function driveNodes(os) { return (os?.drives?.list?.() || []).filter(isRootDrive).map(d => vfsNode(d.root, 'folder', { ...d, name:d.title || d.id, kind:'drive' })); }
function isRootDrive(d) { return d?.root && d.root !== '/' && d.id !== 'home' && d.id !== 'virtual-os'; }
function nodeFrom(path, raw) { const name = cleanName(raw), type = raw?.type === 'directory' ? 'folder' : 'file'; return vfsNode(`${path}/${name}`, type, typeof raw === 'object' ? { ...raw, name } : { name }); }
function cleanName(value) { if (typeof value === 'string' || typeof value === 'number') return String(value); return value?.name || value?.title || value?.label || value?.id || 'Untitled'; }
function aliasMissing(error) { return error?.code === 'awtsmoos_alias_not_ready' || /alias is not ready/i.test(error?.message || ''); }
/** B"H: root is virtual home plus remote drives, not a tunnel hijack. */
