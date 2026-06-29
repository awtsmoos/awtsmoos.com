// B"H
import { ACTIONS, VERSION } from "./actions.js";
import { send, fail } from "./response.js";
import { createHandlers, unsupported } from "./handlers.js";
import { tunnelState, websocketUrl, rememberEnabled } from "./state.js";

async function checkLogin() {
  const response = await fetch("/api/tunnel/control/me", { credentials:"include" });
  const data = await response.json();
  if (!data || data.ok === false) throw new Error("Login required for virtual OS tunnel.");
  return data;
}

export function makeVirtualOSTunnelAgent(state = tunnelState) {
  const handlers = createHandlers();
  return {
    async start() {
      if (state.ws) return;
      await checkLogin();
      rememberEnabled(true);
      state.ws = new WebSocket(websocketUrl());
      state.ws.addEventListener("open", () => this.register());
      state.ws.addEventListener("message", event => this.onMessage(event.data));
      state.ws.addEventListener("close", () => this.reconnect());
    },
    stop() {
      rememberEnabled(false);
      try { state.ws?.close(); } catch (_) {}
      state.ws = null;
    },
    reconnect() {
      state.ws = null;
      if (state.enabled) setTimeout(() => this.start(), 2000);
    },
    register() {
      send(state, registrationPacket(state.name));
    },
    async onMessage(raw) {
      let data; try { data = JSON.parse(raw); } catch { return; }
      if (data.type !== "TUNNEL_REQUEST") return;
      try { send(state, { type:"TUNNEL_RESPONSE", id:data.id, ...(await this.handle(data.payload || {})) }); }
      catch (error) { send(state, { type:"TUNNEL_RESPONSE", id:data.id, ...fail(data.payload?.action || "unknown", error, { stack:error.stack || "" }) }); }
    },
    async handle(payload) {
      const action = payload.action || "snapshot";
      return handlers[action] ? handlers[action](payload) : unsupported(action);
    }
  };
}

function registrationPacket(name) {
  return { type:"TUNNEL_REGISTER", name, deviceName:"Virtual OS", root:"Awtsmoos Virtual OS", allowWrite:false, allowSecrets:false, allowCommands:false, agentVersion:VERSION, browserAgent:true, virtualOs:true, capabilities:{ virtualOs:true, scene:true, graph:true, drives:true, vfs:true, processes:true, input:true, actions:ACTIONS }, tools:{ browser:true, virtualOs:ACTIONS, command:false, nodeScript:false, fsRead:false, fsWrite:false } };
}

/**
 * B"H
 * The agent is the shliach at the gate. It registers the Virtual OS, routes
 * every request to named handlers, and reconnects without hiding its steps in a
 * single collapsed line of lightning.
 */
