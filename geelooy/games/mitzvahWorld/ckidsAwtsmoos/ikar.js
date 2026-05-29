// B"H
/**
 * @file ikar.js
 * @description Chapter 72: the ikar starter becomes a visible ladder of boot
 * phases. The Awtsmoos records every step — manager import, cache cleanup,
 * manager creation, UI wait, JSON fetch, and start dispatch — so no runtime can
 * hang in silence while the player sees black.
 */
import ManagerOfAllWorlds from "./Olam/worldManager/index.js?v=boot-now-json-20260529-bh72";

const IKAR_VERSION = "boot-now-json-20260529-bh72";
const LADDER_JSON = /^ladder-\d+\.json$/;
const LADDER_JS = /^ladder-\d+\.js$/;
const scope = typeof window !== "undefined" ? window : globalThis;

/** @param {string} phase Phase name. @param {object} data Phase data. */
function markPhase(phase, data = {}) {
  scope.__AWTSMOOS_IKAR_PHASES__ ||= [];
  const row = { phase, at: new Date().toISOString(), ...data };
  scope.__AWTSMOOS_IKAR_PHASES__.push(row);
  console.info("B\"H | IKAR_PHASE", JSON.stringify(row));
  return row;
}

/** @param {unknown} value Any thrown value. @param {number} depth Depth. @returns {unknown} */
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

/** @param {unknown} error Error object. @param {object} context Trace context. */
function describeAwtsmoosError(error, context = {}) {
  const details = { context: safeClone(context), thrown: safeClone(error), at: new Date().toISOString(), phases: scope.__AWTSMOOS_IKAR_PHASES__ || [] };
  console.error(`B"H - ${context.label || "Runtime error"} JSON`, JSON.stringify(details, null, 2));
  scope.__AWTSMOOS_LAST_ERROR__ = details;
  scope.__AWTSMOOS_LAST_ERROR_JSON__ = JSON.stringify(details, null, 2);
  renderErrorPanel(details);
  return details;
}

/** @param {object} details Details. */
function renderErrorPanel(details) {
  const root = document.getElementById("ikar") || document.body;
  if (!root) return;
  let panel = document.getElementById("awtsmoosBootErrorPanel");
  if (!panel) {
    panel = document.createElement("pre");
    panel.id = "awtsmoosBootErrorPanel";
    panel.style.cssText = "position:fixed;inset:12px;z-index:999999;padding:16px;overflow:auto;white-space:pre-wrap;background:#190000;color:#ffd7a0;border:2px solid #ff6b2a;font:13px/1.4 monospace;";
    root.appendChild(panel);
  }
  panel.textContent = `B\"H — Mitzvah World boot error\n\n${JSON.stringify(details, null, 2)}`;
}

/** @returns {ManagerOfAllWorlds} Main manager. */
function createManager() {
  markPhase("manager:create:start");
  const manager = new ManagerOfAllWorlds(null);
  scope.mana = manager;
  markPhase("manager:create:done", { hasUi: Boolean(manager.ui) });
  return manager;
}

/** @returns {{ikar:HTMLElement|null,menu:HTMLElement|null,loading:HTMLElement|null}} UI roots. */
function getUI() {
  const ui = scope.mana?.ui;
  const ikar = typeof ui?.$g === "function" ? ui.$g("ikar") : document.getElementById("ikar");
  const menu = typeof ui?.$g === "function" ? ui.$g("menu") || ui.$g("main menu") : document.querySelector(".gameMenu,.menu");
  const loading = typeof ui?.$g === "function" ? ui.$g("loading") : document.querySelector(".loading");
  return { ikar, menu, loading };
}

/** @param {string} raw Requested level id. @returns {string} JSON level id. */
function normalizeLevelId(raw) {
  const clean = String(raw || "").split("/").pop();
  if (LADDER_JS.test(clean)) return clean.replace(/\.js$/i, ".json");
  if (LADDER_JSON.test(clean)) return clean;
  throw new Error("Only Desert Ladder JSON level paths are enabled right now.");
}

/** @param {string} path Level path/id. */
async function loadLadderLevel(path) {
  const id = normalizeLevelId(path);
  const url = new URL(`../levels/ladder/data/${id}?v=${IKAR_VERSION}`, import.meta.url);
  markPhase("level:fetch:start", { id, url: url.href });
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${id} (${response.status})`);
  const data = await response.json();
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Invalid JSON level vessel: ${id}`);
  markPhase("level:fetch:done", { id, nivraTypes: Object.keys(data.nivrayim).length });
  return { id, data };
}

/** @param {number} maxAttempts Poll attempts. */
function waitForIkar(maxAttempts = 120) {
  markPhase("ui:wait:start");
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      const { ikar } = getUI();
      if (ikar && scope.awtsmoosGameUI) {
        clearInterval(interval);
        markPhase("ui:wait:done", { attempts, hasGameUi: true });
        resolve(ikar);
      }
      if (attempts > maxAttempts) {
        clearInterval(interval);
        reject(new Error(`UI readiness timed out after ${attempts} attempts. ikar=${Boolean(ikar)} gameUI=${Boolean(scope.awtsmoosGameUI)}`));
      }
    }, 100);
  });
}

/** @param {boolean} loadingOn Loading visible. */
function setLoadingState(loadingOn) {
  const { menu, loading } = getUI();
  menu?.classList.toggle("hidden", loadingOn);
  menu?.classList.toggle("offscreen", loadingOn);
  menu?.classList.toggle("onscreen", !loadingOn);
  loading?.classList.toggle("hidden", !loadingOn);
}

/** @returns {Promise<void>} Clears old browser caches with a short cap. */
async function clearOldCaches() {
  markPhase("cache:cleanup:start");
  const timeout = new Promise(resolve => setTimeout(() => resolve("timeout"), 1200));
  const cleanup = (async () => {
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map(reg => reg.unregister()));
    const keys = await globalThis.caches?.keys?.() || [];
    await Promise.all(keys.map(key => caches.delete(key)));
    return "done";
  })().catch(error => ({ error: error?.message || String(error) }));
  const result = await Promise.race([cleanup, timeout]);
  markPhase("cache:cleanup:done", { result: safeClone(result) });
}

/** @returns {Promise<void>} Starts level from query param. */
async function handleAutoLoad() {
  const path = new URLSearchParams(location.search).get("path");
  markPhase("autoload:start", { path });
  if (!path) return;
  try {
    const ikar = await waitForIkar();
    setLoadingState(true);
    const loaded = await loadLadderLevel(path);
    markPhase("autoload:dispatch:start", { id: loaded.id });
    ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: loaded.data, sourcePath: loaded.id, gameUiHTML: scope.awtsmoosGameUI } }));
    markPhase("autoload:dispatch:done", { id: loaded.id });
  } catch (error) {
    describeAwtsmoosError(error, { label: "JSON level load failed", phase: "fetch level data" });
    setLoadingState(false);
  }
}

/** @returns {Promise<void>} Boots the game shell. */
async function bootIkar() {
  if (scope.invalid) return;
  markPhase("boot:start", { readyState: document.readyState, version: IKAR_VERSION });
  await clearOldCaches();
  createManager();
  if (document.readyState === "complete") handleAutoLoad();
  else window.addEventListener("load", handleAutoLoad, { once: true });
  markPhase("boot:scheduled-autoload", { readyState: document.readyState });
}

window.addEventListener("error", event => describeAwtsmoosError(event.error || event.message, { label: "Global error", phase: "window.error", moduleURL: event.filename, line: event.lineno, column: event.colno }));
window.addEventListener("unhandledrejection", event => describeAwtsmoosError(event.reason, { label: "Unhandled promise rejection", phase: "window.unhandledrejection" }));
markPhase("module:evaluated", { version: IKAR_VERSION });
bootIkar().catch(error => describeAwtsmoosError(error, { label: "Boot error" }));
