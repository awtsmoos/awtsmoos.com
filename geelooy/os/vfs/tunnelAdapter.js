// B"H
import * as RemoteFs from '../remote/remoteFs.js';
import { vfsNode } from './node.js';
import { unsupported } from './operations.js';
import { buildTunnelCommandRequest, tunnelVirtualList, tunnelVirtualRead } from '../tunnel/virtualTunnelFs.js';

/**
 * B"H
 * The tunnel mount is both a remote filesystem and a revealed command altar.
 * awtsmoos://tunnels/* is virtual and local; other tunnel paths delegate to the
 * connected remote filesystem. Writes stay guarded except run-command requests.
 */
export function tunnelAdapter(os) {
  return {
    id: 'tunnel',
    async list(path) {
      if (isVirtual(path)) return tunnelVirtualList(path).map(item => vfsNode(item.path, item.type === 'folder' ? 'folder' : 'file', item));
      return (await RemoteFs.list(os, path)).map(x => vfsNode(x.path || `${path}/${x.name}`, x.type === 'directory' ? 'folder' : 'file', x));
    },
    async read(path) {
      if (isVirtual(path)) return tunnelVirtualRead(path);
      return await RemoteFs.read(path);
    },
    async stat(path) { return { ok: true, node: vfsNode(path, isFolder(path) ? 'folder' : 'file') }; },
    async write(path, content = '') {
      if (String(path).endsWith('/run-command.request.json')) return buildTunnelCommandRequest(parseJson(content));
      return unsupported('write', path);
    },
    async mkdir(path) { return unsupported('mkdir', path); },
    async remove(path) { return unsupported('remove', path); }
  };
}

function isVirtual(path = '') { return String(path || '').startsWith('awtsmoos://tunnels'); }
function isFolder(path = '') { return isVirtual(path) && !/\.json$/.test(String(path)); }
function parseJson(content) { try { return JSON.parse(String(content || '{}')); } catch { return { command: String(content || '') }; } }
/** B"H: native command execution is exposed as a request object, not a browser shell lie. */
