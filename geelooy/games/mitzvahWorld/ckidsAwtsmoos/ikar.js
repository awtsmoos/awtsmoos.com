// B"H
/**
 * @file ikar.js
 * @description
 * Chapter 22: The gate learns to read both stone JSON and living JS scrolls.
 * The Awtsmoos keeps this root small: diagnostics and level loading now live in
 * reusable boot vessels, so the village may be authored from many files without
 * losing the immediate reliability of `village.json`.
 */
import ManagerOfAllWorlds from "./Olam/worldManager/index.js?v=js-level-source-20260604-bh433";
import { markPhase as mark, reportError } from "./boot/BootDiagnostics.js?v=js-level-source-20260604-bh433";
import { normalizeLevelId, loadLevelData, jsonSourcePath } from "./boot/LevelSource.js?v=js-level-source-20260604-bh433";

const scope = window;
const SEAL = "js-level-source-20260604-bh433";
const markPhase = (phase, data = {}) => mark(SEAL, phase, data);

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
  markPhase("cache:cleanup:done", { result });
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

async function autoloadFromQuery() {
  const rawPath = new URLSearchParams(location.search).get("path");
  const id = normalizeLevelId(rawPath);
  markPhase("autoload:start", { rawPath, id });
  if (!id) return markPhase("autoload:skipped", { reason: "empty or absent path" });
  const ikar = await waitForGameUi();
  const { menu, loading } = uiRoots();
  menu?.classList.add("hidden", "offscreen");
  loading?.classList.remove("hidden");
  const data = await loadLevelData(id, SEAL, markPhase);
  ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: data, sourcePath: jsonSourcePath(id), gameUiHTML: scope.awtsmoosGameUI } }));
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
