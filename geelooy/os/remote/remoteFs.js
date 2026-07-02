// B"H
import * as Client from './tunnelControlClient.js';
import { parseAwtsmoosPath } from './remotePath.js';

export async function list(os, path) {
  const parsed = parseAwtsmoosPath(path);
  if (parsed.kind === 'tunnels' && !parsed.id) return tunnelRoot(os);
  if (parsed.kind === 'tunnels') return tunnelList(parsed.id, parsed.innerPath);
  if (parsed.kind === 'previews' && !parsed.id) return previewRoot(os);
  if (parsed.kind === 'previews') return previewEntry(os, parsed.id);
  if (parsed.kind === 'receipts') return receiptsNotice();
  return [];
}

export async function read(path) {
  const parsed = parseAwtsmoosPath(path);
  if (parsed.kind === 'tunnels') {
    return await fsAction(parsed.id, { action:'read', path:parsed.innerPath || '.', maxChars:200000 });
  }
  if (parsed.kind === 'previews') return { ok:true, content:`Open preview ${parsed.id} in /view/${parsed.id}` };
  return { ok:false, error:'unsupported_remote_read' };
}

async function tunnelRoot(os) {
  const got = await Client.devices().catch(e => ({ ok:false, error:e.message, devices:[] }));
  const devices = got.devices?.length ? got.devices : fallbackDevices(os);
  return devices.map(d => ({
    name:d.deviceName || d.tunnelName,
    type:'directory',
    path:`awtsmoos://tunnels/${d.tunnelName}`,
    drive:d,
    vesselType:d.vesselType || d.kind
  }));
}

async function tunnelList(tunnelName, innerPath) {
  const got = await fsAction(tunnelName, { action:'list', path:innerPath || '.', maxChars:200000 });
  if (got?.ok === false) return pressureNodes(tunnelName, innerPath, got);
  return (got.detailedItems || got.items || []).map(x => {
    return typeof x === 'string' ? fromName(x, tunnelName, innerPath) : fromDetail(x, tunnelName, innerPath);
  });
}

async function fsAction(tunnelName, payload) {
  const virtual = tunnelName === 'awtsmoos-virtual-os' || tunnelName === 'awtsmoos-os';
  return await Client.fsAction(tunnelName, virtual ? { ...payload, targetVessel:'virtual-os' } : payload);
}

function pressureNodes(tunnelName, innerPath, got) {
  const pressure = got.error === 'event_loop_lag_circuit_open' || got.status === 429 || got.httpStatus === 429;
  if (!pressure) throw new Error(got.error || `Tunnel ${tunnelName} could not list files.`);
  return [{
    name:'Tunnel is alive, but busy — tap Refresh in a moment',
    type:'file',
    path:`awtsmoos://tunnels/${tunnelName}/${innerPath || '.'}#busy`,
    error:got.error,
    retryable:true,
    details:got.message || 'The event-loop circuit opened to protect the native vessel.'
  }];
}

async function previewRoot(os) {
  await os?.drives?.refreshRemote?.();
  return (os?.drives?.list?.() || [])
    .filter(d => d.root.startsWith('awtsmoos://previews/'))
    .map(d => ({ name:d.title, type:'file', path:d.root, preview:d.preview }));
}

function previewEntry(os, id) {
  const drive = os?.drives?.get?.(`preview-${id}`);
  return [
    { name:'Open view', type:'file', action:'openPreview', url:drive?.preview?.viewUrl || `/view/${id}` },
    { name:'Raw metadata', type:'file', action:'openPreview', url:`/view/${id}/raw` }
  ];
}

function receiptsNotice() {
  return [{ name:'Mission OS receipts are available through Tunnel Control.', type:'file', action:'openMission' }];
}

function fallbackDevices(os) {
  return (os?.drives?.list?.() || [])
    .filter(d => d.root?.startsWith('awtsmoos://tunnels/'))
    .map(d => ({ ...d, tunnelName:d.tunnelName || d.root.split('/').pop(), deviceName:d.title }));
}

function fromName(name, tunnelName, innerPath = '.') {
  const clean = name.replace(/\/$/, '');
  return { name:clean, type:name.endsWith('/') ? 'directory' : 'file', path:tunnelPath(tunnelName, innerPath, clean) };
}

function fromDetail(item, tunnelName, innerPath = '.') {
  const name = item.name || String(item.path || '').split('/').pop();
  const type = item.isDirectory || item.type === 'folder' || item.type === 'directory' ? 'directory' : 'file';
  return { ...item, name, type, path:item.path?.startsWith('awtsmoos://') ? item.path : tunnelPath(tunnelName, innerPath, item.path || name) };
}

function tunnelPath(tunnelName, innerPath, name) {
  const suffix = [innerPath === '.' ? '' : innerPath, name].filter(Boolean).join('/');
  return `awtsmoos://tunnels/${tunnelName}/${suffix}`;
}

/** B"H: transient tunnel pressure is now a visible object, not a dead chamber. */
