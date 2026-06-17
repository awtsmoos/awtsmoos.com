// B"H
/**
 * @file WorldStateLedger.js
 * @description A tiny vessel where living systems confess their consequences.
 */
const KEY = "mitzvahWorldStateLedger";

function vesselOf(context = {}) { return context.olam || context; }
function sceneOf(context = {}, olam = vesselOf(context)) { return context.scene || olam.scene || null; }
function nowIso() { try { return new Date().toISOString(); } catch { return "unknown-time"; } }
function clean(value) { try { return JSON.parse(JSON.stringify(value)); } catch { return { unserializable:true }; } }
function parts(path) { return String(path || "").split(".").filter(Boolean); }
function read(root, path, fallback) {
  let at = root;
  for (const part of parts(path)) { if (!at || typeof at !== "object" || !(part in at)) return fallback; at = at[part]; }
  return at;
}
function write(root, path, value) {
  const p = parts(path); let at = root;
  while (p.length > 1) { const part = p.shift(); if (!at[part] || typeof at[part] !== "object") at[part] = {}; at = at[part]; }
  if (p.length) at[p[0]] = value;
  return value;
}
function makeLedger() {
  const data = { version:"20260616-bh1", createdAt:nowIso(), loops:{}, events:[] };
  return {
    data,
    get:(path, fallback = null) => read(data, path, fallback),
    set:(path, value) => write(data, path, clean(value)),
    event(type, detail = {}) { const row = { type, at:nowIso(), detail:clean(detail) }; data.events.push(row); data.events = data.events.slice(-80); return row; },
    summary() { return { version:data.version, loopKeys:Object.keys(data.loops), events:data.events.length }; }
  };
}
export function ensureWorldStateLedger(context = {}) {
  const olam = vesselOf(context), scene = sceneOf(context, olam);
  const holder = scene?.userData || olam?.userData || (olam.userData = {});
  if (holder[KEY]?.data) return holder[KEY];
  const ledger = makeLedger(); holder[KEY] = ledger;
  if (scene?.userData) scene.userData[KEY] = ledger;
  if (olam?.userData) olam.userData[KEY] = ledger;
  return ledger;
}
export function worldStateSnapshot(context = {}) { return ensureWorldStateLedger(context).summary(); }
