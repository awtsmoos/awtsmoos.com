// B"H
import { CHAI_FOREST_BASE_URL, CHAI_FOREST_HALF_BASE_URL, FUR_GANG_TEXTURES, groundTextures } from "../assets/ChaiForestStaticAssets.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const KEY = "awtsmoos.chaiForest.assetStore.v1";
const MOVIE_KEY = "awtsmoos.chaiForest.latestMovie.v1";
const read = key => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} return value; };
export function assetStoreSnapshot(extra = {}) { return write(KEY, { BH: "B\"H", updatedAt: Date.now(), base: CHAI_FOREST_BASE_URL, halfBase: CHAI_FOREST_HALF_BASE_URL, furGang: FUR_GANG_TEXTURES, ground: groundTextures(false), ...extra }); }
export function latestAssetStore() { return read(KEY); }
export function storeMovieProof(proof) { return write(MOVIE_KEY, { BH: "B\"H", updatedAt: Date.now(), ...proof }); }
export function latestMovieProof() { return read(MOVIE_KEY); }
export async function preloadChaiAssets({ full = true, limit = 10, progress = true } = {}) {
  const update = self.__AWTSMOOS_LOADING_PROGRESS__?.textureProgress || (() => {});
  const urls = [ `${CHAI_FOREST_BASE_URL}/manifest.json`, `${CHAI_FOREST_HALF_BASE_URL}/manifest.json`, ...Object.values(FUR_GANG_TEXTURES), ...Object.values(groundTextures(!full)) ].slice(0, limit);
  let ok = 0;
  await Promise.allSettled(urls.map(async (url, i) => { const res = await fetch(url, { cache: "force-cache" }); if (!res.ok) throw new Error(`${res.status} ${url}`); ok++; if (progress) update({ stage: "chai-preload", percent: (ok / urls.length) * 100, type: "Chai store" }); return url; }));
  return assetStoreSnapshot({ preloaded: ok, requested: urls.length, full });
}
function deferChaiPreload() {
  const run = () => preloadChaiAssets({ full: false, limit: 6, progress: false }).catch(() => assetStoreSnapshot({ preloaded: 0, failedSoft: true, deferred: true }));
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1200));
  window.addEventListener("awtsmoos-game-ready", () => idle(run, { timeout: 5000 }), { once: true });
  setTimeout(() => {
    if (window.__AWTSMOOS_BOOT_LOADED__ || window.__AWTSMOOS_LOADING_FINAL_READY__?.playable) idle(run, { timeout: 5000 });
  }, 5200);
}
if (typeof window !== "undefined") {
  window.__AWTSMOOS_CHAI_ASSET_STORE__ = { assetStoreSnapshot, latestAssetStore, storeMovieProof, latestMovieProof, preloadChaiAssets, autoPreloadDeferred:true };
  assetStoreSnapshot({ preloaded: 0, deferred: true, reason: "play-first-then-upgrade-textures" });
  deferChaiPreload();
}
