// B"H
// A spark may be tended, fulfilled, or reborn.
import { normalize } from "./normalize.js";

export function fulfill(entry) { return withHistory(entry, "fruit", "The spark bore fruit.", { status: "Fulfilled" }); }
export function tend(entry) { return withHistory(entry, "tended", "The spark was warmed again.", { tendedAt: Date.now(), visits: Number(entry.visits || 0) + 1 }); }
export function relight(entry) {
  const e = normalize(entry);
  return { ...e, id: crypto.randomUUID(), status: "Accepted", createdAt: Date.now(), updatedAt: Date.now(), visits: 0, tendedAt: null, history: [mark("relit", "A new seed rose from an old spark.")] };
}
function withHistory(entry, kind, text, patch) {
  const e = normalize(entry);
  return normalize({ ...e, ...patch, updatedAt: Date.now(), history: [mark(kind, text), ...e.history].slice(0, 8) });
}
function mark(kind, text) { return { kind, text, at: Date.now() }; }
