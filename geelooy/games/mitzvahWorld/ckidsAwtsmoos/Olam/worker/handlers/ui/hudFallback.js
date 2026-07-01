// B"H
/**
 * @file hudFallback.js
 * @description Chapter 720: wallet sparks and animal proof scrolls are direct
 * HUD events, not missing UI nodes. The console quiets, and the proof still
 * enters the world as CustomEvents for any listener that wants it.
 */
import { changeBag, readBag, updatePerutahHud, writeBag } from './hudState.js';
function numeric(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
function emit(name, detail = {}) { try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch {} }
function personalPayload(ob = {}) {
  const absolute = numeric(ob.personalPerutas ?? ob.total ?? ob.value);
  if (absolute !== null) {
    const before = readBag(), value = Math.max(0, Math.floor(absolute));
    writeBag(value); emit("awtsmoosPersonalPerutas", { personalPerutas:value, delta:value - before, reason:ob.reason || ob.source || "sync" });
    return true;
  }
  const delta = numeric(ob.personalDelta ?? ob.delta ?? 0) || 0;
  changeBag(delta, ob.reason || ob.source || "personal perutas"); return true;
}
function animalProof(ob = {}) { emit("awtsmoosAnimalKillProof", ob); return true; }
export function handleHudFallback(shaym, ob = {}) {
  if (shaym === 'personalPerutas') return personalPayload(ob);
  if (shaym === 'animalKillProof') return animalProof(ob);
  if (shaym !== 'gameHUD') return false;
  if (ob.perutahProgress) updatePerutahHud(ob.perutahProgress);
  if (ob.personalPerutas) personalPayload(ob.personalPerutas);
  if (ob.animalKillProof) animalProof(ob.animalKillProof);
  return true;
}
