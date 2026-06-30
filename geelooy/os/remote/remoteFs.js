// B"H
import * as Client from './tunnelControlClient.js';
import { parseAwtsmoosPath } from './remotePath.js';

export async function list(os, path) {
  const parsed = parseAwtsmoosPath(path);
  if (parsed.kind === 'tunnels' && !parsed.id) return tunnelRoot(os);
  if (parsed.kind === 'tunnels') return tunnelList(parsed.id, parsed.innerPath);
  if (parsed.kind === 'previews' && !parsed.id) return previewRoot(os);
  if (parsed.kind === 'previews') return previewEntry(os, parsed.id);
  if (parsed.kind === 'receipts') return [{ name:'Mission OS receipts are available through Tunnel Control.', type:'file', action:'openMission' }];
  return [];
}

export async function read(path) {
  const parsed = parseAwtsmoosPath(path);
  if (parsed.kind === 'tunnels') return await fsAction(parsed.id, { action:'read', path:parsed.innerPath || '.', maxChars:200000 });
  if (parsed.kind === 'previews') return { ok:true, content:`Open preview ${parsed.id} in /view/${parsed.id}` };
  return { ok:false, error:'unsupported_remote_read' };
}

async function tunnelRoot(os) {
  const got = await Client.devices().catch(e => ({ ok:false, error:e.message, devices:[] }));
  const devices = got.devices?.length ? got.devices : fallbackDevices(os);
  return devices.map(d => ({ name:d.deviceName || d.tunnelName, type:'directory', path:`awtsmoos://tunnels/${d.tunnelName}`, drive:d, vesselType:d.vesselType || d.kind }));
}

async function tunnelList(tunnelName, innerPath) {
  const got = await fsAction(tunnelName, { action:'list', path:innerPath || '.', maxChars:200000 });
  if (got?.ok === false) throw new Error(got.error || `Tunnel ${tunnelName} could not list files.`);
  return (got.detailedItems || got.items || []).map(x => typeof x === 'string' ? fromName(x, tunnelName, innerPath) : fromDetail(x, tunnelName, innerPath));
}

async function fsAction(tunnelName, payload) {
  const virtual = tunnelName === 'awtsmoos-virtual-os' || tunnelName === 'awtsmoos-os';
  return await Client.fsAction(tunnelName, virtual ? { ...payload, targetVessel:'virtual-os' } : payload);
}

async function previewRoot(os) { await os?.drives?.refreshRemote?.(); return (os?.drives?.list?.() || []).filter(d => d.root.startsWith('awtsmoos://previews/')).map(d => ({ name:d.title, type:'file', path:d.root, preview:d.preview })); }
function previewEntry(os, id) { const drive = os?.drives?.get?.(`preview-${id}`); return [{ name:'Open view', type:'file', action:'openPreview', url:drive?.preview?.viewUrl || `/view/${id}` }, { name:'Raw metadata', type:'file', action:'openPreview', url:`/view/${id}/raw` }]; }
function fallbackDevices(os) { return (os?.drives?.list?.() || []).filter(d => d.root?.startsWith('awtsmoos://tunnels/')).map(d => ({ ...d, tunnelName:d.tunnelName || d.root.split('/').pop(), deviceName:d.title })); }
function fromName(name, tunnelName, innerPath = '.') { const clean = name.replace(/\/$/, ''); return { name:clean, type:name.endsWith('/') ? 'directory' : 'file', path:`awtsmoos://tunnels/${tunnelName}/${[innerPath === '.' ? '' : innerPath, clean].filter(Boolean).join('/')}` }; }
function fromDetail(item, tunnelName, innerPath = '.') { const name = item.name || String(item.path || '').split('/').pop(); return { ...item, name, type:item.isDirectory || item.type === 'folder' || item.type === 'directory' ? 'directory' : 'file', path:item.path?.startsWith('awtsmoos://') ? item.path : `awtsmoos://tunnels/${tunnelName}/${item.path || [innerPath === '.' ? '' : innerPath, name].filter(Boolean).join('/')}` }; }

/** B"H: remote folders now expose native and hosted virtual vessels, and errors no longer masquerade as emptiness. */
