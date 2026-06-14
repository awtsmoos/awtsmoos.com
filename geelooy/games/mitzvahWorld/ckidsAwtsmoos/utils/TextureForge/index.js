// B"H
/**
 * @module TextureForge
 * @description
 * Chapter 447: FurGenerator becomes the official texture vessel.
 */
import BarkGenerator from "./Generators/Bark.js";
import LeafGenerator from "./Generators/Leaf.js";
import SandGenerator from "./Generators/Sand.js";
import GrassGenerator from "./Generators/Grass.js";
import StoneGenerator from "./Generators/Stone.js";
import BasicPlane from "./Generators/BasicPlane.js";
import SafeGrass from "./Generators/SafeGrass.js";
import Emerald from "./Generators/Emerald.js";
import BrickGenerator from "./Generators/Brick.js";
import WoodGenerator from "./Generators/Wood.js";
import FurGenerator from "./Generators/Fur.js?v=fur-generator-20260614-bh1";
import CanvasHelper from "./CanvasHelper.js";
const VERSION = "texture-forge-20260614-realistic-fur-bh3";
const DB_NAME = "awtsmoos-mitzvah-world-textures";
const STORE = "generatedTextures";
const FUR = new Set(["foxfur","rabbitfur","deerfur","goatfur","frogskin","birdfeather"]);
function progress(stage, type, percent) { try { globalThis.dispatchEvent?.(new CustomEvent("awtsmoos-texture-progress", { detail: { stage, type, percent, version: VERSION } })); } catch (_) {} }
function canIdb() { return typeof indexedDB !== "undefined" && typeof Blob !== "undefined"; }
function openDb() { if (!canIdb()) return Promise.resolve(null); return new Promise(resolve => { const req = indexedDB.open(DB_NAME, 1); req.onupgradeneeded = () => { try { req.result.createObjectStore(STORE); } catch (_) {} }; req.onerror = () => resolve(null); req.onsuccess = () => resolve(req.result); }); }
async function idbGet(key) { const db = await openDb(); if (!db) return null; return new Promise(resolve => { const tx = db.transaction(STORE, "readonly"); const req = tx.objectStore(STORE).get(key); req.onerror = () => resolve(null); req.onsuccess = () => resolve(req.result || null); tx.oncomplete = () => db.close(); }); }
async function idbPut(key, value) { const db = await openDb(); if (!db) return false; return new Promise(resolve => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).put(value, key); tx.oncomplete = () => { db.close(); resolve(true); }; tx.onerror = () => { db.close(); resolve(false); }; }); }
function generatorFor(type) { const t = String(type || "").toLowerCase(); if (FUR.has(t)) return { generate: () => FurGenerator.generate(t) }; switch (t) { case "bark": return BarkGenerator; case "leaf": return LeafGenerator; case "sand": return SandGenerator; case "grass": return GrassGenerator; case "stone": return StoneGenerator; case "basic": return BasicPlane; case "safegrass": return SafeGrass; case "emerald": return Emerald; case "brick": return BrickGenerator; case "wood": return WoodGenerator; default: return SafeGrass; } }
function objectUrl(blob) { return URL.createObjectURL(blob); }
export default class TextureForge {
  static cache = new Map(); static version = VERSION;
  static key(type) { return `${VERSION}:${String(type || "safegrass").toLowerCase()}`; }
  static async generate(type) { const key = this.key(type); if (this.cache.has(key)) { progress("memory-cache-hit", type, 100); return this.cache.get(key); } try { progress("indexeddb-check", type, 10); const cached = await idbGet(key); if (cached instanceof Blob) { const url = objectUrl(cached); this.cache.set(key, url); progress("indexeddb-hit", type, 100); return url; } progress("generate-start", type, 25); const canvas = generatorFor(type).generate(); progress("canvas-ready", type, 64); const blob = await CanvasHelper.toBlob(canvas); progress("blob-ready", type, 78); await idbPut(key, blob); progress("indexeddb-stored", type, 92); const url = objectUrl(blob); this.cache.set(key, url); progress("ready", type, 100); return url; } catch (error) { progress("failed", type, 100); console.error("B\"H - TextureForge failed to crystallize:", type, error); return objectUrl(new Blob([""], { type: "image/png" })); } }
}
