// B"H
import * as Client from "./tunnelControlClient.js";
import { parseAwtsmoosPath } from "./remotePath.js";

export async function list(os, path) {
  const parsed = parseAwtsmoosPath(path);
  if (parsed.kind === "tunnels" && !parsed.id) return tunnelRoot(os, parsed.providerPath);
  if (parsed.kind === "tunnels") return tunnelList(parsed.id, parsed.innerPath, parsed.providerPath);
  if (parsed.kind === "previews" && !parsed.id) return previewRoot(os, parsed.providerPath);
  if (parsed.kind === "previews") return previewEntry(os, parsed.id);
  if (parsed.kind === "receipts") return receiptsNotice(parsed.providerPath);
  return [];
}

export async function read(path) {
  const parsed = parseAwtsmoosPath(path);
  if (parsed.kind === "tunnels") return await fsAction(parsed.id, { action:"read", path:parsed.innerPath || ".", maxChars:200000 });
  if (parsed.kind === "previews") return { ok:true, content:`Open preview ${parsed.id} in /view/${parsed.id}` };
  return { ok:false, error:"unsupported_provider_read" };
}

async function tunnelRoot(os, providerPath = false) {
  const got = await Client.devices().catch(e => ({ ok:false, error:e.message, devices:[] }));
  const devices = got.devices?.length ? got.devices : fallbackDevices(os);
  return devices.map(d => ({ name:d.deviceName || d.tunnelName, type:"directory", path:networkPath(d.tunnelName, "", providerPath), provider:"tunnel", drive:d, vesselType:d.vesselType || d.kind }));
}

async function tunnelList(tunnelName, innerPath, providerPath = false) {
  const got = await fsAction(tunnelName, { action:"list", path:innerPath || ".", maxChars:200000 });
  if (got?.ok === false) return pressureNodes(tunnelName, innerPath, got, providerPath);
  return (got.detailedItems || got.items || []).map(x => typeof x === "string" ? fromName(x, tunnelName, innerPath, providerPath) : fromDetail(x, tunnelName, innerPath, providerPath));
}

async function fsAction(tunnelName, payload) {
  const virtual = tunnelName === "awtsmoos-virtual-os" || tunnelName === "awtsmoos-os";
  return await Client.fsAction(tunnelName, virtual ? { ...payload, targetVessel:"virtual-os" } : payload);
}

function pressureNodes(tunnelName, innerPath, got, providerPath) {
  const pressure = got.error === "event_loop_lag_circuit_open" || got.status === 429 || got.httpStatus === 429;
  if (!pressure) throw new Error(got.error || `Tunnel ${tunnelName} could not list files.`);
  return [{ name:"Tunnel is alive, but busy — tap Refresh in a moment", type:"file", path:`${networkPath(tunnelName, innerPath || ".", providerPath)}#busy`, provider:"tunnel", error:got.error, retryable:true, details:got.message || "The event-loop circuit opened to protect the native vessel." }];
}

async function previewRoot(os, providerPath = false) {
  await os?.drives?.refreshRemote?.();
  return (os?.drives?.list?.() || []).filter(d => d.provider === "preview" || d.kind === "preview").map(d => ({ name:d.title, type:"file", path:providerPath ? d.root : d.url || d.root, provider:"preview", preview:d.preview }));
}

function previewEntry(os, id) {
  const drive = os?.drives?.get?.(`preview-${id}`);
  return [{ name:"Open view", type:"file", action:"openPreview", url:drive?.preview?.viewUrl || `/view/${id}` }, { name:"Raw metadata", type:"file", action:"openPreview", url:`/view/${id}/raw` }];
}

function receiptsNotice() { return [{ name:"Mission OS receipts are available through Tunnel Control.", type:"file", provider:"receipt", action:"openMission" }]; }
function fallbackDevices(os) { return (os?.drives?.list?.() || []).filter(d => d.provider === "tunnel" || d.root?.startsWith("/network/") || d.root?.startsWith("awtsmoos://tunnels/")).map(d => ({ ...d, tunnelName:d.tunnelName || d.root.split("/").pop(), deviceName:d.title })); }
function fromName(name, tunnelName, innerPath = ".", providerPath) { const clean = name.replace(/\/$/, ""); return { name:clean, type:name.endsWith("/") ? "directory" : "file", provider:"tunnel", path:tunnelPath(tunnelName, innerPath, clean, providerPath) }; }
function fromDetail(item, tunnelName, innerPath = ".", providerPath) { const name = item.name || String(item.path || "").split("/").pop(); const type = item.isDirectory || item.type === "folder" || item.type === "directory" ? "directory" : "file"; return { ...item, name, type, provider:"tunnel", path:item.path?.startsWith("awtsmoos://") || item.path?.startsWith("/network/") ? item.path : tunnelPath(tunnelName, innerPath, item.path || name, providerPath) }; }
function tunnelPath(tunnelName, innerPath, name, providerPath) { const suffix = [innerPath === "." ? "" : innerPath, name].filter(Boolean).join("/"); return networkPath(tunnelName, suffix, providerPath); }
function networkPath(tunnelName, suffix = "", providerPath = false) { const clean = suffix ? `/${suffix}` : ""; return providerPath ? `/network/${tunnelName}${clean}` : `awtsmoos://tunnels/${tunnelName}${clean}`; }

/** B"H: remote files now answer through provider paths and legacy URLs alike. */
