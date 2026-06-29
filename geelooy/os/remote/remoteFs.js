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
  if (parsed.kind === 'tunnels') return await Client.fsAction(parsed.id, { action:'read', path:parsed.innerPath, maxChars:200000 });
  if (parsed.kind === 'previews') return { ok:true, content:`Open preview ${parsed.id} in /view/${parsed.id}` };
  return { ok:false, error:'unsupported_remote_read' };
}
async function tunnelRoot(os) { await os?.drives?.refreshRemote?.(); return (os?.drives?.list?.() || []).filter(d => d.root.startsWith('awtsmoos://tunnels/')).map(d => ({ name:d.title, type:'directory', path:d.root, drive:d })); }
async function tunnelList(tunnelName, innerPath) { const got = await Client.fsAction(tunnelName, { action:'list', path:innerPath || '.' }); return (got.detailedItems || got.items || []).map(x => typeof x === 'string' ? { name:x.replace(/\/$/, ''), type:x.endsWith('/') ? 'directory' : 'file' } : { ...x, type:x.isDirectory ? 'directory' : 'file' }); }
async function previewRoot(os) { await os?.drives?.refreshRemote?.(); return (os?.drives?.list?.() || []).filter(d => d.root.startsWith('awtsmoos://previews/')).map(d => ({ name:d.title, type:'file', path:d.root, preview:d.preview })); }
function previewEntry(os, id) { const drive = os?.drives?.get?.(`preview-${id}`); return [{ name:'Open view', type:'file', action:'openPreview', url:drive?.preview?.viewUrl || `/view/${id}` }, { name:'Raw metadata', type:'file', action:'openPreview', url:`/view/${id}/raw` }]; }
