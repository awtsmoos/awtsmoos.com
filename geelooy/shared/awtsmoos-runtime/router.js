// B"H
/**
 * @file router.js
 * @brief Unified runtime router for live tunnel and virtual fallback.
 */

import { actionCapability, normalizeActionName } from './actions.js';
import { sharedVirtualFilesystem } from './virtual-fs.js';

function virtualResult(action, args = {}, fs = sharedVirtualFilesystem) {
  const path = args.path || args.p || '/README.awt';
  if (action === 'list' || action === 'tree' || action === 'findFiles') return { ok: true, virtual: true, action, entries: fs.list(path) };
  if (action === 'read' || action === 'readLines' || action === 'read64') return { ...fs.read(path), action };
  if (action === 'bulk') return { ok: true, virtual: true, action, files: fs.bulk(args.paths || args.files || '') };
  if (action === 'write') return { ...fs.write(path, args.content || ''), action };
  if (action === 'bulkWrite') return bulkWrite(args, fs);
  if (action === 'mkdirp') return { ...fs.mkdirp(path), action };
  if (action === 'stat') return { ...fs.stat(path), action };
  if (['grep', 'rg', 'find', 'selectString', 'bulkSearch'].includes(action)) return { ...fs.search(args.query || args.text || ''), action };
  if (action === 'textStats') return textStats(fs.read(path), action);
  if (action === 'aiContextPack') return { ok: true, virtual: true, action, snapshot: fs.snapshot() };
  if (action === 'simulateRuntime') return simulateVirtual(args);
  return unavailable(action, args);
}

function bulkWrite(args = {}, fs) {
  const writes = Array.isArray(args.writes) ? args.writes : parseWrites(args.writes || args.files || '');
  const results = writes.map(item => fs.write(item.path, item.content));
  return { ok: results.every(r => r.ok), virtual: true, action: 'bulkWrite', results };
}

function parseWrites(text = '') {
  try {
    const json = JSON.parse(String(text || '[]'));
    return Array.isArray(json) ? json : Object.entries(json).map(([path, content]) => ({ path, content }));
  } catch (_e) {
    return [];
  }
}

function textStats(read, action) {
  const text = read.ok ? read.content : '';
  return { ok: read.ok, virtual: true, action, chars: text.length, lines: text ? text.split('\n').length : 0 };
}

function simulateVirtual(args = {}) {
  return { ok: true, virtual: true, action: 'simulateRuntime', simulated: true, runtime: args.runtime || 'virtual', probes: [], result: args.html || args.script || args.command || '' };
}

function unavailable(action, args) {
  return { ok: false, virtual: true, action, capability: actionCapability(action), error: 'This action requires a live tunnel or a richer adapter.', args };
}

/**
 * B"H. Routes one action to live tunnel when available, otherwise virtual OS.
 * @param {object} options Routing options.
 * @returns {Promise<object>} Routed result.
 */
export async function routeAwtsmoosAction(options = {}) {
  const action = normalizeActionName(options.action || options.name);
  const args = options.args || options.arguments || options.payload || {};
  const bridge = options.bridge || null;
  const preferVirtual = options.preferVirtual === true;

  if (!preferVirtual && bridge?.call) {
    try {
      const live = await bridge.call(action, { ...args, action });
      return { ...(live || {}), routedBy: 'awtsmoos-runtime', virtual: false, action };
    } catch (error) {
      if (options.liveOnly) throw error;
      return { ...virtualResult(action, args, options.virtualFs), liveError: error.message || String(error), routedBy: 'awtsmoos-runtime' };
    }
  }

  return { ...virtualResult(action, args, options.virtualFs), routedBy: 'awtsmoos-runtime' };
}

export function makeRuntimeToolBridge(options = {}) {
  return {
    actions: options.actions || [],
    async call(action, args = {}) {
      return await routeAwtsmoosAction({ ...options, action, args });
    }
  };
}
