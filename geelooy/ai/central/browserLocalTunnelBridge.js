// B"H
import { DEFAULT_SAFE_ACTIONS, makeToolSchemas } from "./toolSchemas.js";

const DEFAULT_BASE_URL = "http://127.0.0.1:3977";
const DEFAULT_TOOL_LIMIT = 80;
let cachedBridge = null;

/**
 * B"H
 * Chapter 28: The browser heard the localhost tunnel breathing nearby.
 *
 * The Awtsmoos threads context through a small direct bridge: discover every
 * local action, expose a careful working set to the model, and keep the whole
 * registry callable when the chat already knows the action name.
 */
export class BrowserLocalTunnelBridge {
  constructor({ baseUrl = readSetting("awtsmoos.localTunnelApiUrl", DEFAULT_BASE_URL), toolLimit = readNumber("awtsmoos.localTunnelToolLimit", DEFAULT_TOOL_LIMIT), fetchImpl = fetch } = {}) {
    this.baseUrl = String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.toolLimit = toolLimit;
    this.fetchImpl = fetchImpl;
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

  schemas() {
    return makeToolSchemas(this.actions);
  }

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
    const res = await this.fetchWithTimeout(this.baseUrl + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Local tunnel ${path} failed: ${res.status}`);
    return await res.json();
  }

  async fetchWithTimeout(url, init = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 900);
    try {
      return await this.fetchImpl(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * B"H
 * Discovers the local bridge once per page life, quietly returning null when
 * the tunnel app is not running.
 *
 * @returns {Promise<BrowserLocalTunnelBridge|null>} Local bridge or null.
 */
export async function getBrowserLocalTunnelBridge() {
  if (cachedBridge) return cachedBridge;
  try {
    cachedBridge = await new BrowserLocalTunnelBridge().init();
    return cachedBridge;
  } catch (_e) {
    cachedBridge = null;
    return null;
  }
}

function flattenActions(actions) {
  if (Array.isArray(actions)) return actions;
  if (!actions || typeof actions !== "object") return [];
  return Object.values(actions).flat().filter(value => typeof value === "string");
}

function prioritizeActions(actions, limit) {
  const ordered = [...DEFAULT_SAFE_ACTIONS, ...actions];
  const unique = [...new Set(ordered)].filter(Boolean);
  return unique.slice(0, Math.max(DEFAULT_SAFE_ACTIONS.length, limit));
}

function readSetting(key, fallback) {
  try { return localStorage.getItem(key) || fallback; }
  catch (_e) { return fallback; }
}

function readNumber(key, fallback) {
  const value = Number(readSetting(key, fallback));
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback;
}
