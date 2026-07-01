// B"H
import { actionCatalog, actionNames, commandRunTemplate, findAction } from './actionCatalog.js';

/**
 * B"H
 * /tunnel is a covenantal filesystem: files are not bytes alone but revealed
 * capabilities. Reading a file explains what can be done; writing run-command
 * creates a native command request for the user's own selected tunnel.
 */
export function tunnelVirtualList(path = 'awtsmoos://tunnels') {
  const clean = normalize(path);
  if (clean === 'awtsmoos://tunnels' || clean === 'awtsmoos://tunnels/') return rootItems();
  if (clean === 'awtsmoos://tunnels/actions') return actionCatalog().map(a => node(`${clean}/${a.action}.json`, 'file', a.summary));
  return [];
}

export function tunnelVirtualRead(path = '') {
  const clean = normalize(path);
  if (clean.endsWith('/actions.json')) return json({ ok: true, actions: actionCatalog() });
  if (clean.endsWith('/health.json')) return json({ ok: true, virtual: true, next: 'Call tunnelDoctor through the native tunnel.' });
  if (clean.endsWith('/workers.json')) return json({ ok: true, virtual: true, next: 'Call tunnelDoctor or queueStats on native tunnel for live workers.' });
  if (clean.endsWith('/receipts.json')) return json({ ok: true, virtual: true, next: 'Use commandJobStatus/output pages for command receipts.' });
  if (clean.endsWith('/run-command.schema.json')) return json(runCommandSchema());
  const actionName = clean.split('/').pop()?.replace(/\.json$/, '');
  const item = findAction(actionName);
  if (item) return json({ ok: true, ...item });
  return json({ ok: false, error: 'tunnel_virtual_file_not_found', path });
}

export function buildTunnelCommandRequest({ command = '', cwd = '.', tunnelName = '', allowNative = false } = {}) {
  return {
    ok: true,
    requiresNativeTunnel: true,
    requiresUserTrust: true,
    tunnelName,
    allowNative: allowNative === true,
    payload: commandRunTemplate(command, cwd),
    trust: 'The browser creates a commandRun request for a native tunnel; it does not execute shell code by itself.'
  };
}

export function runCommandSchema() {
  return { ok: true, type: 'object', required: ['command'], properties: { command: { type: 'string' }, cwd: { type: 'string', default: '.' }, tunnelName: { type: 'string' }, allowNative: { type: 'boolean' } }, actions: actionNames() };
}

function rootItems() {
  return [
    node('awtsmoos://tunnels/actions.json', 'file', 'All tunnel actions.'),
    node('awtsmoos://tunnels/actions', 'folder', 'Action files by name.'),
    node('awtsmoos://tunnels/health.json', 'file', 'Tunnel health model.'),
    node('awtsmoos://tunnels/workers.json', 'file', 'Worker manager model.'),
    node('awtsmoos://tunnels/receipts.json', 'file', 'Receipt ledger model.'),
    node('awtsmoos://tunnels/run-command.schema.json', 'file', 'Native command request schema.')
  ];
}
function node(path, type, summary) { return { path, name: path.split('/').pop(), type, summary }; }
function json(value) { return JSON.stringify(value, null, 2); }
function normalize(path = '') { return String(path || 'awtsmoos://tunnels').replace(/\/+$/, ''); }
