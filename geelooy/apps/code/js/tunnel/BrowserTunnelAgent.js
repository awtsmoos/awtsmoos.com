// B"H
import { BrowserCommandAdapter } from "./BrowserCommandAdapter.js";

/**
 * B"H
 * Chapter 15: The code tab became a living tunnel.
 *
 * This agent is intentionally small. The caller supplies an fs bridge with a
 * `call(payload)` function, and the browser tab registers as a websocket vessel.
 * It reconnects, re-registers, and dispatches safe browser workspace actions.
 */
export class BrowserTunnelAgent {
  constructor({ tunnelName, workspaceName = "Awtsmoos Code", fs, wsUrl = defaultWsUrl(), fetchSession = defaultSession } = {}) {
    this.tunnelName = tunnelName || storedTunnelName(workspaceName);
    this.workspaceName = workspaceName;
    this.fs = fs;
    this.wsUrl = wsUrl;
    this.fetchSession = fetchSession;
    this.command = new BrowserCommandAdapter({ fs });
    this.ws = null;
    this.enabled = false;
  }

  async start() {
    await this.fetchSession();
    this.enabled = true;
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener("open", () => this.register());
    this.ws.addEventListener("message", event => this.onMessage(event.data));
    this.ws.addEventListener("close", () => this.reconnect());
    return this;
  }

  stop() { this.enabled = false; try { this.ws?.close(); } catch (_) {} this.ws = null; }

  register() {
    this.send({ type: "TUNNEL_REGISTER", protocolVersion: "awtsmoos-tunnel-v2", tunnelName: this.tunnelName, name: this.tunnelName, vesselType: "browser-tab", browserAgent: true, deviceName: this.workspaceName, root: "browser://apps-code", allowWrite: true, allowSecrets: false, allowCommands: false, agentVersion: "browser-tab-tunnel-0.1.0", capabilities: { browserTab: true, fsRead: true, fsWrite: true, commandRun: "simulated", runtime: "browser" }, tools: { browserTab: true, fsRead: true, fsWrite: true, command: "simulated" } });
  }

  async onMessage(raw) {
    let data;
    try { data = JSON.parse(raw); } catch (_) { return; }
    if (data.type !== "TUNNEL_REQUEST") return;
    try { this.send({ type: "TUNNEL_RESPONSE", id: data.id, ...(await this.handle(data.payload || {})) }); }
    catch (error) { this.send({ type: "TUNNEL_RESPONSE", id: data.id, ok: false, error: error.message, stack: error.stack || "", vessel: "browser-tab" }); }
  }

  async handle(payload = {}) {
    const action = payload.action || "list";
    if (action === "command" || action === "commandRun" || action === "shellCommand") return await this.command.run(payload);
    if (!this.fs?.call) return { ok: false, action, vessel: "browser-tab", error: "missing_browser_fs_bridge" };
    return { ...(await this.fs.call(payload)), vessel: "browser-tab", tunnelName: this.tunnelName };
  }

  reconnect() { this.ws = null; if (this.enabled) setTimeout(() => this.start().catch(console.error), 2000); }
  send(packet) { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(packet)); }
}

function defaultWsUrl() { return `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`; }
async function defaultSession() { const res = await fetch("/api/tunnel/control/me", { credentials: "include" }); const got = await res.json(); if (!got?.ok) throw new Error("Login required for browser tunnel."); return got; }
function storedTunnelName(workspaceName) { const key = "awtsmoos.browserTunnel.name"; const old = localStorage.getItem(key); if (old) return old; const name = `awt-browser-${slug(workspaceName)}-${Math.floor(1000 + Math.random() * 9000)}`; localStorage.setItem(key, name); return name; }
function slug(value) { return String(value || "code").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "code"; }
