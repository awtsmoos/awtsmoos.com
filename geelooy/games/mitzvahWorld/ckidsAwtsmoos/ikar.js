// B"H
/**
 * @file ikar.js
 * @description
 * Chapter 3: The path gate learns restraint. A bare `?path` is no longer a
 * command to drag the player into a world. The Awtsmoos opens only the named
 * vessel; silence remains silence, and choice remains choice.
 */
import ManagerOfAllWorlds from "./Olam/worldManager/index.js";

const scope = window;
const LEVELS = new Set(["village.json", "ladder-1.json", "ladder-2.json", "ladder-3.json", "ladder-4.json", "ladder-5.json"]);

function markPhase(phase, data = {}) {
  scope.__AWTSMOOS_IKAR_PHASES__ ||= [];
  const row = { phase, at: new Date().toISOString(), ...data };
  scope.__AWTSMOOS_IKAR_PHASES__.push(row);
  console.info("B\"H | IKAR_PHASE", JSON.stringify(row));
  return row;
}

function safeClone(value, depth = 0) {
  if (depth > 4) return "[MaxDepth]";
  if (value == null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack, cause: safeClone(value.cause, depth + 1) };
  if (Array.isArray(value)) return value.map(item => safeClone(item, depth + 1));
  if (typeof value === "object") {
    const out = { kind: value?.constructor?.name || "Object", string: String(value) };
    for (const key of Object.keys(value).slice(0, 80)) out[key] = safeClone(value[key], depth + 1);
    return out;
  }
  return String(value);
}

function renderErrorPanel(details) {
  const root = document.getElementById("ikar") || document.body;
  let panel = document.getElementById("awtsmoosBootErrorPanel");
  if (!panel) {
    panel = document.createElement("pre");
    panel.id = "awtsmoosBootErrorPanel";
    panel.style.cssText = "position:fixed;inset:12px;z-index:999999;padding:16px;overflow:auto;white-space:pre-wrap;background:#190000;color:#ffd7a0;border:2px solid #ff6b2a;font:13px/1.4 monospace;";
    root.appendChild(panel);
  }
  panel.textContent = `B\"H — Mitzvah World boot error\n\n${JSON.stringify(details, null, 2)}`;
}

function reportError(error, context = {}) {
  const details = { context: safeClone(context), thrown: safeClone(error), phases: scope.__AWTSMOOS_IKAR_PHASES__ || [], at: new Date().toISOString() };
  scope.__AWTSMOOS_LAST_ERROR__ = details;
  scope.__AWTSMOOS_LAST_ERROR_JSON__ = JSON.stringify(details, null, 2);
  console.error(`B"H - ${context.label || "Runtime error"} JSON`, scope.__AWTSMOOS_LAST_ERROR_JSON__);
  renderErrorPanel(details);
}

function normalizeLevelId(raw) {
  const rawText = String(raw ?? "").trim();
  if (!rawText) return null;
  const clean = rawText.split(/[?#]/)[0].split("/").pop();
  const json = clean.replace(/\.js$/i, ".json").toLowerCase();
  if (LEVELS.has(json)) return json;
  throw new Error("Only village.json and ladder-N.json level paths are enabled here.");
}

async function clearOldCaches() {
  markPhase("cache:cleanup:start");
  const cleanup = (async () => {
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map(reg => reg.unregister()));
    const keys = await caches?.keys?.() || [];
    await Promise.all(keys.map(key => caches.delete(key)));
    return "done";
  })().catch(error => ({ error: error?.message || String(error) }));
  const result = await Promise.race([cleanup, new Promise(resolve => setTimeout(() => resolve("timeout"), 900))]);
  markPhase("cache:cleanup:done", { result: safeClone(result) });
}

function createManager() {
  markPhase("manager:create:start");
  scope.mana = new ManagerOfAllWorlds(null);
  markPhase("manager:create:done", { hasUi: Boolean(scope.mana?.ui) });
}

function uiRoots() {
  const ui = scope.mana?.ui;
  return { ikar: ui?.$g?.("ikar") || document.getElementById("ikar"), menu: ui?.$g?.("menu") || ui?.$g?.("main menu"), loading: ui?.$g?.("loading") };
}

async function waitForGameUi() {
  for (let attempts = 1; attempts <= 160; attempts += 1) {
    const { ikar } = uiRoots();
    if (ikar && scope.awtsmoosGameUI) return ikar;
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  throw new Error("UI readiness timed out before level autoload.");
}

async function fetchLevel(id) {
  const url = new URL(`../levels/ladder/data/${id}?bh=grounded-village-3`, import.meta.url);
  markPhase("level:fetch:start", { id, url: url.href });
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${id} (${response.status})`);
  const data = await response.json();
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Invalid JSON level vessel: ${id}`);
  markPhase("level:fetch:done", { id, nivraTypes: Object.keys(data.nivrayim).length });
  return data;
}

async function autoloadFromQuery() {
  const params = new URLSearchParams(location.search);
  const rawPath = params.has("path") ? params.get("path") : null;
  const id = normalizeLevelId(rawPath);
  markPhase("autoload:start", { rawPath, id });
  if (!id) return markPhase("autoload:skipped", { reason: "empty or absent path" });
  const ikar = await waitForGameUi();
  const { menu, loading } = uiRoots();
  menu?.classList.add("hidden", "offscreen");
  loading?.classList.remove("hidden");
  const data = await fetchLevel(id);
  ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: data, sourcePath: id, gameUiHTML: scope.awtsmoosGameUI } }));
  markPhase("autoload:dispatch:done", { id });
}

async function boot() {
  markPhase("module:evaluated");
  await clearOldCaches();
  createManager();
  await autoloadFromQuery();
  markPhase("boot:done");
}

window.addEventListener("error", event => reportError(event.error || event.message, { label: "Global error", phase: "window.error", moduleURL: event.filename, line: event.lineno, column: event.colno }));
window.addEventListener("unhandledrejection", event => reportError(event.reason, { label: "Unhandled promise rejection", phase: "window.unhandledrejection" }));
boot().catch(error => reportError(error, { label: "Boot error" }));
