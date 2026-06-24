// B"H
// Time gives each spark a face.
import { lifecycle, ritualById } from "../concepts.js";
import { normalize } from "./normalize.js";
import { safeTime, stamp } from "./helpers.js";

export function stage(entry) {
  const e = normalize(entry);
  if (e.status === "Fulfilled") return lifecycle.Fulfilled;
  if (isDormant(e)) return lifecycle.Dormant;
  if (e.tendedAt && Date.now() - e.tendedAt < 86400000) return lifecycle.Tended;
  if (Date.now() - e.createdAt > 86400000) return lifecycle.Growing;
  return lifecycle.Accepted;
}
export function isDormant(entry) { const e = normalize(entry); return e.deadline && Date.now() > e.deadline && e.status !== "Fulfilled"; }
export function describe(entry) {
  const e = normalize(entry), ritual = ritualById(e.ritual), life = stage(e);
  return { ritual, life, age: age(e.createdAt), due: due(e.deadline), resonance: Math.min(100, 12 + e.intensity * 14 + e.visits * 7 + e.history.length * 4) };
}
function age(t) { const h = Math.max(0, Math.floor((Date.now() - stamp(t, Date.now())) / 36e5)); return h < 1 ? "just planted" : h < 24 ? `${h}h old` : `${Math.floor(h / 24)}d old`; }
function due(t) { if (!safeTime(t)) return "no deadline"; const h = Math.ceil((t - Date.now()) / 36e5); return h < 0 ? "calling from dormancy" : h < 24 ? `${h}h left` : `${Math.ceil(h / 24)}d left`; }
