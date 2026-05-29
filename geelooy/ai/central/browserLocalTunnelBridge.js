// B"H
import { DEFAULT_SAFE_ACTIONS, makeToolSchemas } from "./toolSchemas.js";

const DEFAULT_BASE_URL = "http://127.0.0.1:3977";
const DEFAULT_TOOL_LIMIT = 500;
let cachedBridge = null;

/**
 * B"H
 * Chapter 155: The Tool Constellation Was No Longer Cropped.
 *
 * The bridge discovers every local action the Awtsmoos tunnel exposes and keeps
 * the whole catalog unless the user explicitly lowers the limit in localStorage.
 */
export class BrowserLocalTunnelBridge {
  constructor({ baseUrl = readSetting("awtsmoos.localTunnelApiUrl", DEFAULT_BASE_URL), toolLimit = readNumber("awtsmoos.localTunnelToolLimit", DEFAULT_TOOL_LIMIT), fetchImpl = null } = {}) {
    this.baseUrl = String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.toolLimit = toolLimit;
    this.fetchImpl = safeFetch(fetchImpl);
    this.actions = [...DEFAULT_SAFE_ACTIONS];
    this.available = false;
  }

  async init() {
    const data = await this.get("/actions");
    const discovered = flattenActions(data.actions);
    this.actions = prioritizeActions(discovered.length ? discovered : DEFAULT_SAFE_ACTIONS, this.toolLimit);
    this.available = true;
    return this;
  }

  schemas() { return makeToolSchemas(this.actions); }

  async call(name, args = {}) {
    const action = String(name || args.action || "").replace(/^[^.]+\./, "");
    return await this.post("/tool", { name: action, arguments: { ...args, action } });
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
function prioritizeActions(actions, limit) {
  const unique = [...new Set([...DEFAULT_SAFE_ACTIONS, ...actions])].filter(Boolean);
  return unique.slice(0, Math.max(DEFAULT_SAFE_ACTIONS.length, limit));
}
function readSetting(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_e) { return fallback; } }
function readNumber(key, fallback) { const value = Number(readSetting(key, fallback)); return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback; }
