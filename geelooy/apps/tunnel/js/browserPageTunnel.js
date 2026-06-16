// B"H
import { BrowserStorageFsAdapter } from "../../../shared/virtual-os/fs/adapters/BrowserStorageFsAdapter.js";

/**
 * B"H
 * Chapter 49: The public tunnel page kept old item names while carrying rich details.
 */
const STORE_KEY = "awtsmoos.tunnel.browserWorkspace.files";
const NAME_KEY = "awtsmoos.tunnel.browserWorkspace.name";
const VERSION = "browser-tunnel-page-0.1.0";

function adapter() { return new BrowserStorageFsAdapter({ storage: localStorage, storeKey: STORE_KEY }); }

export const BrowserPageTunnel = {
  ws: null,
  enabled: false,
  statusEl: null,

  init() {
    this.statusEl = document.getElementById("browserTunnelStatus");
    document.getElementById("startBrowserTunnel")?.addEventListener("click", () => this.start());
    document.getElementById("stopBrowserTunnel")?.addEventListener("click", () => this.stop());
    this.render("idle");
  },

  async start() {
    await this.checkLogin();
    this.enabled = true;
    this.ws = new WebSocket(wsUrl());
    this.ws.addEventListener("open", () => this.register());
    this.ws.addEventListener("message", e => this.onMessage(e.data));
    this.ws.addEventListener("close", () => { this.ws = null; this.render("disconnected"); if (this.enabled) setTimeout(() => this.start().catch(console.error), 2000); });
    this.render("connecting");
  },

  stop() { this.enabled = false; try { this.ws?.close(); } catch (_) {} this.ws = null; this.render("stopped"); },

  async checkLogin() {
    const res = await fetch("/api/tunnel/control/me", { credentials: "include" });
    const got = await res.json();
    if (!got?.ok) throw new Error("Login required for browser tunnel mode.");
    return got;
  },

  register() {
    const tunnelName = name();
    this.send(registrationPacket(tunnelName));
    this.render("connected as " + tunnelName);
  },

  async onMessage(raw) {
    let packet;
    try { packet = JSON.parse(raw); } catch (_) { return; }
    if (packet.type !== "TUNNEL_REQUEST") return;
    try { this.send({ type: "TUNNEL_RESPONSE", id: packet.id, ...(await runBrowserPageAction(packet.payload || {})), vessel: "browser-tab", tunnelName: name() }); }
    catch (error) { this.send({ type: "TUNNEL_RESPONSE", id: packet.id, ok: false, error: error.message, vessel: "browser-tab" }); }
  },

  send(packet) { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(packet)); },
  render(text) { if (this.statusEl) this.statusEl.textContent = text; }
};

export function registrationPacket(tunnelName = name()) {
  return { type: "TUNNEL_REGISTER", protocolVersion: "awtsmoos-tunnel-v2", name: tunnelName, tunnelName, vesselType: "browser-tab", browserAgent: true, deviceName: "Tunnel Page Browser Workspace", root: "browser://apps/tunnel/localStorage", allowWrite: true, allowSecrets: false, allowCommands: false, agentVersion: VERSION, capabilities: { browserTab: true, fsRead: true, fsWrite: true, commandRun: "simulated", storage: "localStorage" }, tools: { browserTab: true, fsRead: true, fsWrite: true, command: "simulated" } };
}

export async function runBrowserPageAction(payload = {}) {
  const result = await adapter().run(payload);
  if (result.action === "list" && Array.isArray(result.detailedItems)) return { ...result, items: result.detailedItems.map(item => item.name) };
  return result;
}

function name() { const old = localStorage.getItem(NAME_KEY); if (old) return old; const next = "awt-browser-tunnel-" + Math.floor(1000 + Math.random() * 9000); localStorage.setItem(NAME_KEY, next); return next; }
function wsUrl() { return `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`; }
