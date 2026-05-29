// B"H
import { DEFAULT_SAFE_ACTIONS, describeTool, makeBridgeToolSchemas, normalizeActionCatalog, toolCallName, toolDetailName } from "./toolSchemas.js";
import { sanitizeToolArguments } from "./toolArgumentSanitizer.js";
import { isNextStepToolName, normalizeNextStepIntent } from "./nextStepTool.js";

const DEFAULT_BASE_URL = "http://127.0.0.1:3977";
const SCHEMA_ENDPOINTS = Object.freeze(["/actions", "/tools", "/schemas", "/manifest"]);
let cachedBridge = null;

/**
 * B"H
 * Chapter 260: The Browser Bridge Asked The Tunnel For Every Tool's True Name.
 *
 * The bridge now builds a dynamic action catalog from every schema-shaped API
 * response the tunnel exposes. `/actions` can still be just a name list, but if
 * `/tools`, `/schemas`, or `/manifest` gives richer JSON schemas, essential
 * direct tools and awtsmoos_tool_details both receive the full per-action shape.
 */
export class BrowserLocalTunnelBridge {
  constructor({ baseUrl = readSetting("awtsmoos.localTunnelApiUrl", DEFAULT_BASE_URL), fetchImpl = null } = {}) {
    this.baseUrl = String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = safeFetch(fetchImpl);
    this.catalog = normalizeActionCatalog(DEFAULT_SAFE_ACTIONS);
    this.actions = [...DEFAULT_SAFE_ACTIONS];
    this.allActions = [...DEFAULT_SAFE_ACTIONS];
    this.available = false;
  }

  async init() {
    this.catalog = await this.loadDynamicCatalog();
    this.allActions = this.catalog.map(item => item.name);
    this.actions = essentialActions(this.allActions);
    this.available = true;
    return this;
  }

  schemas() { return makeBridgeToolSchemas(this.actions, this.catalog); }

  async call(name, args = {}) {
    const requested = String(name || args.name || args.action || "").replace(/^[^.]+\./, "");
    if (isNextStepToolName(requested)) return { ok: true, virtual: true, action: requested, nextStep: normalizeNextStepIntent(args) };
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
      ? this.catalog.filter(item => requested.includes(item.name))
      : this.catalog.filter(item => !query || item.name.toLowerCase().includes(query) || String(item.description || "").toLowerCase().includes(query)).slice(0, 40);
    return { ok: true, essential: this.actions, count: this.catalog.length, names: this.allActions, matches: matches.map(item => item.name), details: matches.map(describeTool) };
  }

  async loadDynamicCatalog() {
    const payloads = [];
    for (const endpoint of SCHEMA_ENDPOINTS) {
      const data = await this.tryGet(endpoint);
      if (data) payloads.push(tagCatalogSource(data, endpoint));
    }
    const merged = mergeCatalogs(payloads.flatMap(normalizeActionCatalog));
    return merged.length ? merged : normalizeActionCatalog(DEFAULT_SAFE_ACTIONS);
  }

  async tryGet(path) {
    try { return await this.get(path); }
    catch (_error) { return null; }
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

function tagCatalogSource(data, endpoint) {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(item => tagOne(item, endpoint));
  const copy = { ...data };
  for (const key of ["actions", "tools", "schemas", "functions", "catalog"]) if (copy[key]) copy[key] = tagCatalogSource(copy[key], endpoint);
  return copy;
}
function tagOne(item, endpoint) { return typeof item === "string" ? { name: item, source: endpoint } : { ...(item || {}), source: item?.source || endpoint }; }
function mergeCatalogs(items = []) {
  const byName = new Map();
  for (const item of items.filter(item => item?.name)) {
    const old = byName.get(item.name);
    byName.set(item.name, chooseRicher(old, item));
  }
  return [...byName.values()];
}
function chooseRicher(a, b) {
  if (!a) return b;
  if (richness(b) >= richness(a)) return { ...a, ...b, source: [a.source, b.source].filter(Boolean).join(",") };
  return { ...b, ...a, source: [b.source, a.source].filter(Boolean).join(",") };
}
function richness(item = {}) { return Number(Boolean(item.parameters || item.schema || item.inputSchema || item.input_schema)) * 10 + Number(Boolean(item.description)) * 2 + Object.keys(item.raw || item).length; }
function attachSanitizerWarnings(result, warnings = []) { return warnings.length ? { ...(result || {}), awtsmoosSanitizerWarnings: warnings } : result; }
function essentialActions(actions = []) { const available = new Set(actions); return DEFAULT_SAFE_ACTIONS.filter(name => available.has(name)); }
function safeFetch(fetchImpl) { if (typeof fetchImpl === "function") return fetchImpl.bind?.(globalThis) || fetchImpl; if (typeof globalThis.fetch === "function") return globalThis.fetch.bind(globalThis); throw new Error("No fetch implementation is available for the local tunnel bridge."); }
function readSetting(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_e) { return fallback; } }
