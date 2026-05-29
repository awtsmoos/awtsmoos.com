// B"H
/**
 * @file ikar.js
 * @description Chapter 59: Desert levels are fetched as JSON vessels. No level
 * JavaScript is imported; the Awtsmoos interpreter receives pure data only.
 */
import ManagerOfAllWorlds from "./Olam/worldManager/index.js?v=lean-l1-20260528-bh53";

const IKAR_VERSION = "lean-json-levels-20260528-bh59";
const LADDER_JSON = /^ladder-\d+\.json$/;
const LADDER_JS = /^ladder-\d+\.js$/;

/** @param {unknown} error Error object. @param {object} context Trace context. */
function describeAwtsmoosError(error, context = {}) {
  const details = { context, name: error?.name, message: error?.message || String(error), stack: error?.stack, cause: error?.cause };
  console.error(`B"H - ${context.label || "Runtime error"}`, details);
  window.__AWTSMOOS_LAST_ERROR__ = details;
  return details;
}

/** @returns {ManagerOfAllWorlds} Main manager. */
function createManager() {
  const manager = new ManagerOfAllWorlds(null);
  window.mana = manager;
  return manager;
}

/** @returns {{ikar:HTMLElement|null,menu:HTMLElement|null,loading:HTMLElement|null}} UI roots. */
function getUI() {
  const ui = window.mana?.ui;
  const ikar = typeof ui?.$g === "function" ? ui.$g("ikar") : null;
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
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${id} (${response.status})`);
  const data = await response.json();
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Invalid JSON level vessel: ${id}`);
  return { id, data };
}

/** @param {number} maxAttempts Poll attempts. */
function waitForIkar(maxAttempts = 200) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      const { ikar } = getUI();
      if (ikar && window.awtsmoosGameUI) { clearInterval(interval); resolve(ikar); }
      if (attempts > maxAttempts) { clearInterval(interval); reject(new Error("UI readiness timed out.")); }
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

/** @returns {Promise<void>} Clears old browser caches. */
async function clearOldCaches() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map(reg => reg.unregister()));
    const keys = await globalThis.caches?.keys?.() || [];
    await Promise.all(keys.map(key => caches.delete(key)));
  } catch (error) { console.warn("B\"H - cache cleanup skipped", error); }
}

/** @returns {Promise<void>} Starts level from query param. */
async function handleAutoLoad() {
  const path = new URLSearchParams(window.location.search).get("path");
  if (!path) return;
  try {
    const ikar = await waitForIkar();
    setLoadingState(true);
    const loaded = await loadLadderLevel(path);
    ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: loaded.data, sourcePath: loaded.id, gameUiHTML: window.awtsmoosGameUI } }));
  } catch (error) {
    describeAwtsmoosError(error, { label: "JSON level load failed", phase: "fetch level data" });
    alert(`Failed to load world.\n${error.message}`);
    setLoadingState(false);
  }
}

/** @returns {Promise<void>} Boots the game shell. */
async function bootIkar() {
  if (window.invalid) return;
  await clearOldCaches();
  createManager();
  if (document.readyState === "complete") handleAutoLoad();
  else window.addEventListener("load", handleAutoLoad, { once: true });
}

window.addEventListener("error", event => describeAwtsmoosError(event.error || event.message, { label: "Global error", phase: "window.error", moduleURL: event.filename, line: event.lineno, column: event.colno }));
window.addEventListener("unhandledrejection", event => describeAwtsmoosError(event.reason, { label: "Unhandled promise rejection", phase: "window.unhandledrejection" }));
bootIkar().catch(error => describeAwtsmoosError(error, { label: "Boot error" }));
