// B"H
import { DEFAULT_SAFE_ACTIONS, describeTool, makeBridgeToolSchemas, toolCallName, toolDetailName } from "./toolSchemas.js";
import { sanitizeToolArguments } from "./toolArgumentSanitizer.js";

const DEFAULT_BASE_URL = "http://127.0.0.1:3977";
let cachedBridge = null;

/**
 * B"H
 * Chapter 229: The Tunnel Gate Washed Write Arguments Before Letting Them Pass.
 *
 * The model may stream perfect intent through imperfect provider/browser cloth.
 * Before any write-like action reaches the local tunnel, this bridge strips
 * markdown fences, stray thinking tags, and DevTools ghosts like `<Author:` so
 * source files are not poisoned by UI metadata.
 */
export class BrowserLocalTunnelBridge {
  constructor({ baseUrl = readSetting("awtsmoos.localTunnelApiUrl", DEFAULT_BASE_URL), fetchImpl = null } = {}) {
    this.baseUrl = String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = safeFetch(fetchImpl);
    this.actions = [...DEFAULT_SAFE_ACTIONS];
    this.allActions = [...DEFAULT_SAFE_ACTIONS];
    this.available = false;
  }

  async init() {
    const data = await this.get("/actions");
    const discovered = flattenActions(data.actions);
    this.allActions = unique(discovered.length ? discovered : DEFAULT_SAFE_ACTIONS);
    this.actions = essentialActions(this.allActions);
    this.available = true;
    return this;
  }

  schemas() { return makeBridgeToolSchemas(this.actions, this.allActions); }

  async call(name, args = {}) {
    const requested = String(name || args.name || args.action || "").replace(/^[^.]+\./, "");
    if (requested === toolDetailName()) return this.toolDetails(args);
    if (requested === toolCallName()) return await this.call(String(args.name || args.action || ""), args.arguments || args.args || {});
    const clean = sanitizeToolArguments(requested, args);
    const result = await this.post("/tool", { name: requested, arguments: { ...clean.args, action: requested } });
    return attachSanitizerWarnings(result, clean.warnings);
  }

  toolDetails(args = {}) {
    const requested = Array.isArray(args.names) ? args.names.map(String) : [];
    const query = String(args.query || "").trim().toLowerCase();
    const matches = requested.length
      ? requested.filter(name => this.allActions.includes(name))
      : this.allActions.filter(name => !query || name.toLowerCase().includes(query)).slice(0, 40);
    return { ok: true, essential: this.actions, count: this.allActions.length, names: this.allActions, matches, details: matches.map(describeTool) };
  }

  async get(path) {
    const res = await this.fetchWithTimeout(this.baseUrl + path, { method: "GET" });
    if (!res.ok) throw new Error(`Local tunnel ${path} failed: ${res.status}`);
    return await res.json();
  }

  async post(path, body) {
    const res = await this.fetchWithTimeout(this.baseUrl + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Local tunnel ${path} failed: ${res.status}`);
    return await res.json();
  }

  async fetchWithTimeout(url, init = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try { return await this.fetchImpl(url, { ...init, signal: controller.signal }); }
    finally { clearTimeout(timer); }
  }
}

export async function getBrowserLocalTunnelBridge() {
  if (cachedBridge) return cachedBridge;
  try { cachedBridge = await new BrowserLocalTunnelBridge().init(); return cachedBridge; }
  catch (_e) { cachedBridge = null; return null; }
}

function attachSanitizerWarnings(result, warnings = []) {
  if (!warnings.length) return result;
  return { ...(result || {}), awtsmoosSanitizerWarnings: warnings };
}
function essentialActions(actions = []) {
  const available = new Set(actions);
  return DEFAULT_SAFE_ACTIONS.filter(name => available.has(name));
}
function safeFetch(fetchImpl) {
  if (typeof fetchImpl === "function") return fetchImpl.bind?.(globalThis) || fetchImpl;
  if (typeof globalThis.fetch === "function") return globalThis.fetch.bind(globalThis);
  throw new Error("No fetch implementation is available for the local tunnel bridge.");
}
function flattenActions(actions) {
  if (Array.isArray(actions)) return actions;
  if (!actions || typeof actions !== "object") return [];
  return Object.values(actions).flat(Infinity).filter(value => typeof value === "string");
}
function unique(values = []) { return [...new Set(values.filter(Boolean).map(String))]; }
function readSetting(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_e) { return fallback; } }
