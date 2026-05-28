// B"H
/**
 * @file ikar.js
 * @description
 * Chapter 7: The direct ladder gate with fresh visibility cache keys.
 */
import ManagerOfAllWorlds from "./Olam/worldManager/index.js?v=lean-l1-20260528-bh11";

const VERSION = "lean-l1-20260528-bh11";

function createManager() {
  const manager = new ManagerOfAllWorlds(null);
  window.mana = manager;
  return manager;
}

function getUI() {
  const ui = window.mana?.ui;
  const ikar = typeof ui?.$g === "function" ? ui.$g("ikar") : null;
  const menu = typeof ui?.$g === "function" ? ui.$g("menu") || ui.$g("main menu") : document.querySelector(".gameMenu,.menu");
  const loading = typeof ui?.$g === "function" ? ui.$g("loading") : document.querySelector(".loading");
  return { ikar, menu, loading };
}

async function loadLadderLevel(path) {
  const clean = String(path || "").split("/").pop();
  if (!/^ladder-\d+\.js$/.test(clean)) throw new Error("Only Desert Ladder level paths are enabled right now.");
  const module = await import(`../levels/ladder/${clean}?v=${VERSION}`);
  return { id: clean, data: module.default };
}

function waitForIkar(maxAttempts = 200) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      const { ikar } = getUI();
      if (ikar && window.awtsmoosGameUI) {
        clearInterval(interval);
        resolve(ikar);
        return;
      }
      if (attempts > maxAttempts) {
        clearInterval(interval);
        reject(new Error("UI readiness timed out. ikar or awtsmoosGameUI missing."));
      }
    }, 100);
  });
}

function setLoadingState(loadingOn) {
  const { menu, loading } = getUI();
  menu?.classList.toggle("hidden", loadingOn);
  menu?.classList.toggle("offscreen", loadingOn);
  menu?.classList.toggle("onscreen", !loadingOn);
  loading?.classList.toggle("hidden", !loadingOn);
}

async function clearOldCaches() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map(reg => reg.unregister()));
    const keys = await globalThis.caches?.keys?.() || [];
    await Promise.all(keys.map(key => caches.delete(key)));
  } catch (error) {
    console.warn("B\"H - cache/service worker cleanup skipped", error);
  }
}

async function handleAutoLoad() {
  const path = new URLSearchParams(window.location.search).get("path");
  if (!path) return;
  try {
    const ikar = await waitForIkar();
    setLoadingState(true);
    const loaded = await loadLadderLevel(path);
    ikar.dispatchEvent(new CustomEvent("start", {
      detail: { worldDayuh: loaded.data, sourcePath: loaded.id, gameUiHTML: window.awtsmoosGameUI }
    }));
  } catch (error) {
    console.error("B\"H Auto-load failed:", error);
    alert(`Failed to load world.\n${error.message}`);
    setLoadingState(false);
  }
}

async function bootIkar() {
  if (window.invalid) return;
  await clearOldCaches();
  createManager();
  if (document.readyState === "complete") handleAutoLoad();
  else window.addEventListener("load", handleAutoLoad, { once: true });
}

bootIkar().catch(error => console.error("B\"H - Error caught:", error));
