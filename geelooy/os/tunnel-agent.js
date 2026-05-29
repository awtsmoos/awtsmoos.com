// B"H
/**
 * B"H
 * Chapter 29: The virtual OS became a tunnel of its own.
 *
 * The Awtsmoos OS can now register as a browser tunnel when the logged-in user
 * explicitly enables it. Its tools are OS-safe: snapshot, windows, start-menu,
 * focus, and fullscreen. It does not pretend to run native shell commands.
 */
const VERSION = "virtual-os-tunnel-1.0.0";
const ACTIONS = Object.freeze(["snapshot", "windows", "startMenu", "focusWindow", "toggleFullscreen"]);

const state = { ws: null, enabled: localStorage.getItem("awtsmoos.os.tunnel.enabled") === "true", name: localStorage.getItem("awtsmoos.os.tunnel.name") || `awt-os-${Math.floor(1000 + Math.random() * 9000)}` };
localStorage.setItem("awtsmoos.os.tunnel.name", state.name);

function url() { return `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`; }
function send(packet) { if (state.ws?.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(packet)); }
function ok(action, data = {}) { return { ok: true, action, tunnel: "virtualOs", ...data }; }

async function checkLogin() {
  const res = await fetch("/api/tunnel/control/me", { credentials: "include" });
  const data = await res.json();
  if (!data || data.ok === false) throw new Error("Login required for virtual OS tunnel.");
  return data;
}

const handlers = {
  snapshot: () => ok("snapshot", { title: document.title, windows: [...document.querySelectorAll(".window")].map(windowInfo), fullscreen: !!document.fullscreenElement }),
  windows: () => ok("windows", { windows: [...document.querySelectorAll(".window")].map(windowInfo) }),
  startMenu: () => ok("startMenu", { items: [...document.querySelectorAll("#menu-items li")].map(x => x.textContent.trim()).filter(Boolean) }),
  focusWindow: payload => { const el = document.querySelector(payload.selector || `.window[data-id="${payload.id}"]`); if (!el) throw new Error("Window not found."); el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); return ok("focusWindow", { focused: windowInfo(el) }); },
  toggleFullscreen: () => { window.os?.toggleFullScreen?.(); return ok("toggleFullscreen", { fullscreen: !!document.fullscreenElement }); }
};

function windowInfo(el) { return { id: el.dataset.id || "", title: el.querySelector(".window-header")?.textContent?.trim() || el.textContent.slice(0, 80), className: el.className }; }

export const VirtualOSTunnelAgent = {
  async start() {
    if (state.ws) return;
    await checkLogin();
    state.enabled = true; localStorage.setItem("awtsmoos.os.tunnel.enabled", "true");
    state.ws = new WebSocket(url());
    state.ws.addEventListener("open", () => this.register());
    state.ws.addEventListener("message", event => this.onMessage(event.data));
    state.ws.addEventListener("close", () => { state.ws = null; if (state.enabled) setTimeout(() => this.start(), 2000); });
  },
  stop() { state.enabled = false; localStorage.setItem("awtsmoos.os.tunnel.enabled", "false"); try { state.ws?.close(); } catch (_) {} state.ws = null; },
  register() { send({ type: "TUNNEL_REGISTER", name: state.name, deviceName: "Virtual OS", root: "Awtsmoos Virtual OS", allowWrite: false, allowSecrets: false, allowCommands: false, agentVersion: VERSION, browserAgent: true, virtualOs: true, capabilities: { virtualOs: true, actions: ACTIONS }, tools: { browser: true, virtualOs: ACTIONS, command: false, nodeScript: false, fsRead: false, fsWrite: false } }); },
  async onMessage(raw) { let data; try { data = JSON.parse(raw); } catch (_) { return; } if (data.type !== "TUNNEL_REQUEST") return; try { send({ type: "TUNNEL_RESPONSE", id: data.id, ...(await this.handle(data.payload || {})) }); } catch (error) { send({ type: "TUNNEL_RESPONSE", id: data.id, ok: false, error: error.message, stack: error.stack || "" }); } },
  async handle(payload) { const action = payload.action || "snapshot"; if (!handlers[action]) return { ok: false, error: "Unsupported virtual OS action", availableActions: ACTIONS }; return handlers[action](payload); }
};

window.VirtualOSTunnelAgent = VirtualOSTunnelAgent;
if (state.enabled) VirtualOSTunnelAgent.start().catch(console.error);
