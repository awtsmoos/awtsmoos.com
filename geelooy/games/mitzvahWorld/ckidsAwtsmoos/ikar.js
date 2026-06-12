// B"H
/**
 * @file ikar.js
 * @description
 * Chapter 445: The boot gate becomes lean while the probe sings elsewhere.
 *
 * The Awtsmoos does not merely boot a world; it demands testimony from the
 * world. This gate now creates the manager, cleans stale browser vessels,
 * autoloads a level, and delegates Chossid proof globals to a dedicated module.
 */
import ManagerOfAllWorlds from "./Olam/worldManager/index.js?compact=true&v=village-polish-20260612-bh811";
import { markPhase as mark, reportError } from "./boot/BootDiagnostics.js?compact=true&v=village-polish-20260612-bh811";
import { normalizeLevelId, loadLevelData, jsonSourcePath } from "./boot/LevelSource.js?compact=true&v=visible-root-binding-20260610-bh710";
import { installPlayerGuaranteeProbe } from "./boot/PlayerGuaranteeProbe.js?compact=true&v=visible-root-binding-20260610-bh710";

const scope = window;
const SEAL = "village-polish-20260612-bh811";
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
  const timeout = new Promise(resolve => setTimeout(() => resolve("timeout"), 900));
  const result = await Promise.race([cleanup, timeout]);
  markPhase("cache:cleanup:done", { result });
}

function createManager() {
  markPhase("manager:create:start");
  scope.mana = new ManagerOfAllWorlds(null);
  markPhase("manager:create:done", { hasUi: Boolean(scope.mana?.ui), seal: SEAL });
}

function uiRoots() {
  const ui = scope.mana?.ui;
  return {
    ikar: ui?.$g?.("ikar") || document.getElementById("ikar"),
    menu: ui?.$g?.("menu") || ui?.$g?.("main menu"),
    loading: ui?.$g?.("loading")
  };
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
  installPlayerGuaranteeProbe(scope, SEAL);
  markPhase("module:evaluated");
  await clearOldCaches();
  createManager();
  await autoloadFromQuery();
  markPhase("boot:done");
}

window.addEventListener("error", event => reportError(event.error || event.message, { label: "Global error", phase: "window.error", moduleURL: event.filename, line: event.lineno, column: event.colno }));
window.addEventListener("unhandledrejection", event => reportError(event.reason, { label: "Unhandled promise rejection", phase: "window.unhandledrejection" }));
boot().catch(error => reportError(error, { label: "Boot error" }));
