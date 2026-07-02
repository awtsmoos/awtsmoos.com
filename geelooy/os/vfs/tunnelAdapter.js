// B"H
import * as RemoteFs from '../remote/remoteFs.js';
import { vfsNode } from './node.js';
import { unsupported } from './operations.js';
import { buildTunnelCommandRequest } from '../tunnel/virtualTunnelFs.js';

/**
 * B"H
 * The old vessel mistook every awtsmoos://tunnels path for a local dream and
 * showed action receipts where real roots should shine. This adapter now lets
 * tunnel paths be tunnels: living native files through RemoteFs. Only the
 * explicit command request file remains virtual and guarded.
 */
export function tunnelAdapter(os) {
  return {
    id: 'tunnel',
    async list(path) {
      return (await RemoteFs.list(os, path)).map(item => nodeFor(path, item));
    },
    async read(path) {
      if (isCommandRequest(path)) return commandRequestHelp(path);
      return await RemoteFs.read(path);
    },
    async stat(path) {
      return { ok: true, node: vfsNode(path, isFolderPath(path) ? 'folder' : 'file') };
    },
    async write(path, content = '') {
      if (isCommandRequest(path)) return buildTunnelCommandRequest(parseJson(content));
      return unsupported('write', path);
    },
    async mkdir(path) { return unsupported('mkdir', path); },
    async remove(path) { return unsupported('remove', path); }
  };
}

function nodeFor(parentPath, item = {}) {
  const path = item.path || joinPath(parentPath, item.name || 'unnamed');
  return vfsNode(path, isFolderItem(item) ? 'folder' : 'file', item);
}

function isFolderItem(item = {}) {
  return item.isDirectory || ['folder', 'directory'].includes(item.type || item.kind);
}

function isFolderPath(path = '') {
  const value = String(path || '');
  return !/\.[A-Za-z0-9]{1,8}$/.test(value) || value === 'awtsmoos://tunnels';
}

function joinPath(parent = '', name = '') {
  const base = String(parent || '').replace(/\/+$/, '');
  return `${base}/${String(name).replace(/^\/+/, '')}`;
}

function isCommandRequest(path = '') {
  return String(path || '').endsWith('/run-command.request.json');
}

function commandRequestHelp(path) {
  return {
    ok: true,
    path,
    content: JSON.stringify({ command: 'pwd', cwd: '.', note: 'Write JSON here to request a guarded tunnel command.' }, null, 2)
  };
}

function parseJson(content) {
  try { return JSON.parse(String(content || '{}')); }
  catch { return { command: String(content || '') }; }
}
