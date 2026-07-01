// B"H
/**
 * @file ikar.js
 * @description
 * The boot gate bows before the Awtsmoos and lets the first visible frame live.
 * Heavy cleanup is no longer allowed to hold the loader hostage. The world is
 * summoned after a paint breath, while performance probes reveal the renderer.
 */
import ManagerOfAllWorlds from "./Olam/worldManager/index.js?compact=true&v=zone-reality-20260614-bh817";
import { markPhase as mark, reportError } from "./boot/BootDiagnostics.js?compact=true&v=zone-reality-20260614-bh817";
import { normalizeLevelId, loadLevelData, jsonSourcePath } from "./boot/LevelSource.js?compact=true&v=local-route-alias-20260701-bh1";
import { installPlayerGuaranteeProbe } from "./boot/PlayerGuaranteeProbe.js?compact=true&v=visible-root-binding-20260610-bh710";

const scope = window;
const SEAL = "frame-rescue-20260618-bh2";
const markPhase = (phase, data = {}) => mark(SEAL, phase, data);
const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));

function emit(name, detail = {}) {
  try {
    const EventClass = scope.CustomEvent || CustomEvent;
    scope.dispatchEvent?.(new EventClass(name, { detail: { seal: SEAL, mana: scope.mana, ...detail } }));
  } catch {}
}

function performanceProbe(phase, data = {}) {
  emit("awtsmoos:performance-probe", { phase, ...data });
  emit("awtsmoos-game-ready", { phase, ...data });
}

async function clearOldCaches() {
  markPhase("cache:cleanup:start", { mode: "background" });
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map(reg => reg.unregister()));
    const keys = await caches?.keys?.() || [];
    await Promise.all(keys.filter(key => /stale|old|debug/i.test(key)).map(key => caches.delete(key)));
    markPhase("cache:cleanup:done", { result: "background", serviceWorkers: regs.length, cacheKeys: keys.length });
  } catch (error) {
    markPhase("cache:cleanup:error", { error: error?.message || String(error) });
  }
}

function startCacheCleanup() {
  const requested = new URLSearchParams(location.search).has("clearCaches");
  if (!requested) return markPhase("cache:cleanup:skipped", { reason: "add ?clearCaches to force" });
  setTimeout(() => clearOldCaches(), 0);
  return markPhase("cache:cleanup:scheduled");
}

function createManager() {
  markPhase("manager:create:start");
  scope.mana = new ManagerOfAllWorlds(null);
  scope.__AWTSMOOS_MANAGER__ = scope.mana;
  markPhase("manager:create:done", { hasUi: Boolean(scope.mana?.ui), seal: SEAL });
  performanceProbe("manager:create:done");
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
  await nextFrame();
  const data = await loadLevelData(id, SEAL, markPhase);
  await nextFrame();
  ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: data, sourcePath: jsonSourcePath(id), gameUiHTML: scope.awtsmoosGameUI } }));
  markPhase("autoload:dispatch:done", { id });
  performanceProbe("autoload:dispatch:done", { id });
}

async function boot() {
  installPlayerGuaranteeProbe(scope, SEAL);
  markPhase("module:evaluated");
  startCacheCleanup();
  await nextFrame();
  createManager();
  await nextFrame();
  await autoloadFromQuery();
  markPhase("boot:done");
  performanceProbe("boot:done");
}

window.addEventListener("error", event => reportError(event.error || event.message, { label: "Global error", phase: "window.error", moduleURL: event.filename, line: event.lineno, column: event.colno }));
window.addEventListener("unhandledrejection", event => reportError(event.reason, { label: "Unhandled promise rejection", phase: "window.unhandledrejection" }));
boot().catch(error => reportError(error, { label: "Boot error" }));
