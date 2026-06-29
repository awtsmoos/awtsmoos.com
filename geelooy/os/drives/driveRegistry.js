// B"H
import { DEFAULT_DRIVES } from "./defaultDrives.js";
import * as Client from "../remote/tunnelControlClient.js";
import { deviceDrive, previewDrive } from "./tunnelDriveMapper.js";
export class DriveRegistry {
  constructor(os, drives = DEFAULT_DRIVES) { this.os = os; this.drives = [...drives]; this.lastRefresh = 0; }
  list() { return this.drives.map(d => ({ ...d })); }
  get(id) { return this.drives.find(d => d.id === id || d.root === id || d.tunnelName === id) || null; }
  mount(drive) { const old = this.get(drive.id); if (old) Object.assign(old, drive); else this.drives.push(drive); return this.get(drive.id); }
  unmount(id) { const n = this.drives.length; this.drives = this.drives.filter(d => d.id !== id); return n !== this.drives.length; }
  resolve(path = "/") { const match = [...this.drives].sort((a,b)=>b.root.length-a.root.length).find(d => path === d.root || path.startsWith(`${d.root}/`)); return match ? { drive:match, rest:path.slice(match.root.length).replace(/^\//, "") } : { drive:this.get("home"), rest:path.replace(/^\//, "") }; }
  async refreshRemote() {
    const got = await Client.devices().catch(e => ({ ok:false, error:e.message, devices:[] }));
    (got.devices || []).forEach(d => this.mount(deviceDrive(d)));
    const previews = await Client.previewList().catch(() => ({ previews:[] }));
    (previews.previews || []).slice(0, 50).forEach(p => this.mount(previewDrive(p)));
    this.lastRefresh = Date.now(); return { devices:got, previews };
  }
}
export function makeDriveRegistry(os) { return new DriveRegistry(os); }
