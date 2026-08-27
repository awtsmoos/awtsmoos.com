// B"H
// Normalization is mercy for old data.
import { paths, ritualById } from "../concepts.js";
import { clamp, clean, safeTime, stamp } from "./helpers.js";

export function normalize(entry = {}) {
  const now = Date.now(), id = clean(entry.id) || crypto.randomUUID();
  const createdAt = stamp(entry.createdAt, now), updatedAt = stamp(entry.updatedAt, createdAt);
  return { ...entry, id, title: clean(entry.title) || "Hidden spark", note: clean(entry.note),
    type: paths.includes(entry.type) ? entry.type : paths[0], visibility: validVisibility(entry.visibility),
    status: clean(entry.status) || "Accepted", ritual: ritualById(entry.ritual).id,
    intensity: clamp(entry.intensity, 1, 5), createdAt, updatedAt, deadline: safeTime(entry.deadline),
    visits: Number(entry.visits || 0), tendedAt: safeTime(entry.tendedAt),
    history: Array.isArray(entry.history) ? entry.history.slice(-8) : [], demo: !!entry.demo, removed: !!entry.removed };
}
export const normalizeAll = entries => (Array.isArray(entries) ? entries : []).map(normalize);
function validVisibility(v) { return ["Private", "Invitation", "Communal"].includes(v) ? v : "Private"; }
