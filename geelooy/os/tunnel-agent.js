// B"H
const VERSION = "virtual-os-tunnel-1.1.0";
const ACTIONS = Object.freeze(["snapshot","scene","drives","windows","taskbar","startMenu","focusWindow","toggleFullscreen","openDrive"]);
const state = { ws:null, enabled:localStorage.getItem("awtsmoos.os.tunnel.enabled") === "true", name:localStorage.getItem("awtsmoos.os.tunnel.name") || `awt-os-${Math.floor(1000 + Math.random() * 9000)}` };
localStorage.setItem("awtsmoos.os.tunnel.name", state.name);
function url() { return `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`; }
function send(packet) { if (state.ws?.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(packet)); }
function ok(action, data = {}) { return { ok:true, action, tunnel:"virtualOs", ...data }; }
async function checkLogin() { const res = await fetch("/api/tunnel/control/me", { credentials:"include" }); const data = await res.json(); if (!data || data.ok === false) throw new Error("Login required for virtual OS tunnel."); return data; }
const handlers = {
  snapshot:() => ok("snapshot", window.os?.snapshot?.() || basicSnapshot()),
  scene:() => ok("scene", { scene:window.os?.scene?.() || basicSnapshot() }),
  drives:() => ok("drives", { drives:window.os?.drives?.list?.() || [] }),
  taskbar:() => ok("taskbar", { taskbar:window.os?.taskbar?.snapshot?.() || {} }),
  windows:() => ok("windows", { windows:[...document.querySelectorAll(".window")].map(windowInfo) }),
  startMenu:() => ok("startMenu", { items:[...document.querySelectorAll("#menu-items li")].map(x => x.textContent.trim()).filter(Boolean) }),
  focusWindow:p => { const el = document.querySelector(p.selector || `.window[data-id="${p.id}"]`); if (!el) throw new Error("Window not found."); el.dispatchEvent(new MouseEvent("mousedown", { bubbles:true })); return ok("focusWindow", { focused:windowInfo(el) }); },
  openDrive:p => { window.os?.addWindow?.({ title:p.title || "Remote Drive", path:p.path || "awtsmoos://tunnels", os:window.os, programName:"awtsmoosFileExplorer" }); return ok("openDrive", { path:p.path || "awtsmoos://tunnels" }); },
  toggleFullscreen:() => { window.os?.toggleFullScreen?.(); return ok("toggleFullscreen", { fullscreen:!!document.fullscreenElement }); }
};
function basicSnapshot() { return { title:document.title, windows:[...document.querySelectorAll(".window")].map(windowInfo), fullscreen:!!document.fullscreenElement }; }
function windowInfo(el) { const r = el.getBoundingClientRect?.(); return { id:el.dataset.id || "", title:el.querySelector(".window-header")?.textContent?.trim() || el.textContent.slice(0, 80), className:el.className, rect:r ? { x:r.x, y:r.y, width:r.width, height:r.height } : null }; }
export const VirtualOSTunnelAgent = {
  async start() { if (state.ws) return; await checkLogin(); state.enabled = true; localStorage.setItem("awtsmoos.os.tunnel.enabled", "true"); state.ws = new WebSocket(url()); state.ws.addEventListener("open", () => this.register()); state.ws.addEventListener("message", e => this.onMessage(e.data)); state.ws.addEventListener("close", () => { state.ws = null; if (state.enabled) setTimeout(() => this.start(), 2000); }); },
  stop() { state.enabled = false; localStorage.setItem("awtsmoos.os.tunnel.enabled", "false"); try { state.ws?.close(); } catch (_) {} state.ws = null; },
  register() { send({ type:"TUNNEL_REGISTER", name:state.name, deviceName:"Virtual OS", root:"Awtsmoos Virtual OS", allowWrite:false, allowSecrets:false, allowCommands:false, agentVersion:VERSION, browserAgent:true, virtualOs:true, capabilities:{ virtualOs:true, scene:true, drives:true, actions:ACTIONS }, tools:{ browser:true, virtualOs:ACTIONS, command:false, nodeScript:false, fsRead:false, fsWrite:false } }); },
  async onMessage(raw) { let data; try { data = JSON.parse(raw); } catch { return; } if (data.type !== "TUNNEL_REQUEST") return; try { send({ type:"TUNNEL_RESPONSE", id:data.id, ...(await this.handle(data.payload || {})) }); } catch (error) { send({ type:"TUNNEL_RESPONSE", id:data.id, ok:false, error:error.message, stack:error.stack || "" }); } },
  async handle(payload) { const action = payload.action || "snapshot"; if (!handlers[action]) return { ok:false, error:"Unsupported virtual OS action", availableActions:ACTIONS }; return handlers[action](payload); }
};
window.VirtualOSTunnelAgent = VirtualOSTunnelAgent;
if (state.enabled) VirtualOSTunnelAgent.start().catch(console.error);
/** B"H: the browser OS now reports a scene, drives, taskbar, and windows to the tunnel. */
