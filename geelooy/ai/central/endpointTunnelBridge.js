// B"H
import { ALL_TUNNEL_ACTIONS } from "./actionCatalog.js";
import { DEFAULT_SAFE_ACTIONS, describeTool, makeBridgeToolSchemas, toolCallName, toolDetailName } from "./toolSchemas.js";
import { sanitizeToolArguments } from "./toolArgumentSanitizer.js";
import { isNextStepToolName, normalizeNextStepIntent } from "./nextStepTool.js";

const DEFAULT_CONTROL_URL = "/api/tunnel/control";
const VIRTUAL_TUNNEL_NAME = "awtsmoos-virtual-os";

/**
 * B"H — OAuth endpoint bridge.
 * The local bridge knocks on 127.0.0.1; this bridge knocks on the Awtsmoos
 * endpoint palace and carries browser OAuth cookies with `credentials: include`.
 */
export class EndpointTunnelBridge {
  constructor(options = {}) {
    this.controlUrl = options.controlUrl || readSetting("awtsmoos.endpointTunnelControlUrl", DEFAULT_CONTROL_URL);
    this.tunnelName = options.tunnelName || readSetting("awtsmoos.endpointTunnelName", "");
    this.targetVessel = options.targetVessel || "";
    this.fetchImpl = safeFetch(options.fetchImpl);
    this.actions = [...DEFAULT_SAFE_ACTIONS];
    this.allActions = [...ALL_TUNNEL_ACTIONS];
    this.catalog = ALL_TUNNEL_ACTIONS.map(name => ({ name, source: "endpoint" }));
    this.available = true;
  }
  async init() { return this; }
  schemas() { return makeBridgeToolSchemas(this.actions, this.catalog); }
  async call(name, args = {}) {
    const requested = String(name || args.name || args.action || "").replace(/^[^.]+\./, "");
    if (isNextStepToolName(requested)) return { ok: true, virtual: true, action: requested, nextStep: normalizeNextStepIntent(args) };
    if (requested === toolDetailName()) return this.toolDetails(args);
    if (requested === toolCallName()) return await this.call(String(args.name || args.action || ""), args.arguments || args.args || {});
    const clean = sanitizeToolArguments(requested, args);
    return attachWarnings(await this.dispatch(requested, clean.args), clean.warnings);
  }
  toolDetails(args = {}) {
    const query = String(args.query || "").toLowerCase();
    const names = Array.isArray(args.names) ? args.names.map(String) : [];
    const matches = this.catalog.filter(item => names.length ? names.includes(item.name) : !query || item.name.toLowerCase().includes(query)).slice(0, 60);
    return { ok: true, bridge: "endpoint", directSafe: this.actions, count: this.catalog.length, names: this.allActions, matches: matches.map(x => x.name), details: matches.map(describeTool) };
  }
  async dispatch(action, args = {}) {
    const body = this.payload(action, args);
    const res = await this.fetchImpl(this.controlUrl, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Awtsmoos endpoint tunnel failed: ${res.status}`);
    return await res.json();
  }
  payload(action, args = {}) {
    return cleanObject({
      ...args,
      action,
      tunnelName: args.tunnelName || this.tunnelName || undefined,
      targetVessel: args.targetVessel || this.targetVessel || undefined
    });
  }
}

export function makeVirtualOsTunnelBridge(options = {}) {
  return new EndpointTunnelBridge({ ...options, tunnelName: VIRTUAL_TUNNEL_NAME, targetVessel: "virtual-os" });
}

function cleanObject(obj) { return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== "")); }
function attachWarnings(result, warnings = []) { return warnings.length ? { ...(result || {}), awtsmoosSanitizerWarnings: warnings } : result; }
function safeFetch(fetchImpl) { if (typeof fetchImpl === "function") return fetchImpl; if (typeof fetch === "function") return fetch.bind(globalThis); throw new Error("No fetch implementation is available for endpoint tunnel bridge."); }
function readSetting(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_e) { return fallback; } }
