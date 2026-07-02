// B"H
import { DEFAULT_DRIVES } from "./defaultDrives.js";
import * as Client from "../remote/tunnelControlClient.js";
import { deviceDrive, previewDrive } from "./tunnelDriveMapper.js";
import { providerCapabilities } from "../providers/capabilities.js";

export class DriveRegistry {
  constructor(os, drives = DEFAULT_DRIVES) { this.os = os; this.drives = drives.map(normalizeDrive); this.lastRefresh = 0; }
  list() { return this.drives.map(d => ({ ...d })); }
  get(id) { return this.drives.find(d => d.id === id || d.root === id || d.url === id || d.tunnelName === id) || null; }
  mount(drive) { const next = normalizeDrive(drive); const old = this.get(next.id); if (old) Object.assign(old, next); else this.drives.push(next); return this.get(next.id); }
  unmount(id) { const n = this.drives.length; this.drives = this.drives.filter(d => d.id !== id); return n !== this.drives.length; }
  resolve(path = "/") { const text = String(path || "/"); const match = [...this.drives].sort((a,b)=>b.root.length-a.root.length).find(d => text === d.root || text.startsWith(`${d.root}/`) || text === d.url); return match ? { drive:match, mount:match, rest:text.slice(match.root.length).replace(/^\//, "") } : { drive:this.get("home"), mount:this.get("home"), rest:text.replace(/^\//, "") }; }
  mounts() { return this.list(); }
  async refreshRemote() { const got = await Client.devices().catch(e => ({ ok:false, error:e.message, devices:[] })); (got.devices || []).forEach(d => this.mount(deviceDrive(d))); const previews = await Client.previewList().catch(() => ({ previews:[] })); (previews.previews || []).slice(0, 50).forEach(p => this.mount(previewDrive(p))); this.lastRefresh = Date.now(); return { devices:got, previews }; }
}

export function normalizeDrive(drive = {}) { const provider = drive.provider || drive.kind || "virtual"; return { ...drive, kind:provider, provider, providerId:drive.providerId || drive.tunnelName || provider, capabilities:providerCapabilities({ ...drive, provider }), url:drive.url || `awtsmoos://mount${drive.root || "/"}` }; }
export function makeDriveRegistry(os) { return new DriveRegistry(os); }

/** B"H: one registry, many garments; no explorer asks how far the object lives. */
