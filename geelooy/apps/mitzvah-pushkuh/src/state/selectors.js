// B"H
// Selectors read the garden without disturbing its roots.
import { dayPrompt, paths } from "../concepts.js";
import { normalizeAll } from "./normalize.js";
import { stage } from "./lifecycle.js";

export function stats(entries) {
  const visible = normalizeAll(entries).filter(e => !e.removed);
  const fulfilled = visible.filter(e => e.status === "Fulfilled").length;
  const dormant = visible.filter(e => stage(e)[0] === "stone").length;
  const tended = visible.filter(e => e.tendedAt).length;
  return { total: visible.length, fulfilled, dormant, tended, alive: visible.length - fulfilled - dormant, paths: new Set(visible.map(e => e.type)).size };
}
export function filtered(entries, filter) {
  return normalizeAll(entries).filter(e => !e.removed).filter(e => keep(e, filter)).sort((a, b) => b.updatedAt - a.updatedAt);
}
export function oracle(entries) {
  const s = stats(entries);
  if (!s.total) return dayPrompt();
  if (s.dormant) return "Some sparks are sleeping. Wake them with mercy, not shame.";
  if (s.tended > s.fulfilled) return "The garden feels tended. Return is itself a light.";
  if (s.fulfilled >= 3) return "Fruit is appearing. The hidden world is becoming visible.";
  return `${dayPrompt()} The soil remembers every small act.`;
}
export function constellations(entries) {
  return paths.map(type => ({ type, rows: normalizeAll(entries).filter(e => e.type === type && !e.removed) })).filter(c => c.rows.length > 1);
}
function keep(e, filter) { return filter === "fulfilled" ? e.status === "Fulfilled" : filter === "dormant" ? stage(e)[0] === "stone" : filter === "alive" ? e.status !== "Fulfilled" && stage(e)[0] !== "stone" : true; }
