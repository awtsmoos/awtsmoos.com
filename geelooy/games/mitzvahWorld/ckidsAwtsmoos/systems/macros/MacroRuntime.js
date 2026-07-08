// B"H
/**
 * @file MacroRuntime.js
 * @description
 * Chapter 633: A macro is a tiny shlichus-script. Lines of command become a
 * ladder: target, cast, attack. The Awtsmoos creates every line now, and the
 * runtime keeps it bounded, visible, and safe.
 */
import { executeCommand } from "../chat/CommandRuntime.js?compact=true&v=starter-contracts-20260628-bh9";
import { assignActionSlot } from "../torah/TorahActionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addChatMessage } from "../chat/ChatRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
const DEFAULT_MACRO = "/target nearest\n/cast 1\n/attack";
export function ensureMacros(olam) {
  const p = playerOf(olam); if (!p) return null;
  p.macroState ||= { macros: [{ id: "starter_shema_attack", name: "Shema Attack", icon: "ש", body: DEFAULT_MACRO }] };
  emitMacros(olam); return p.macroState;
}
export function createMacro(olam, data = {}) {
  const state = ensureMacros(olam), id = data.id || `macro_${Date.now()}`;
  const macro = { id, name: data.name || "New Macro", icon: data.icon || "✦", body: String(data.body || "") };
  const i = state.macros.findIndex(m => m.id === id); if (i >= 0) state.macros[i] = macro; else state.macros.push(macro);
  emitMacros(olam); return macro;
}
export function runMacro(olam, idOrMacro) {
  const state = ensureMacros(olam), macro = typeof idOrMacro === "string" ? state.macros.find(m => m.id === idOrMacro) : idOrMacro;
  if (!macro) return false;
  const lines = String(macro.body || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 12);
  addChatMessage(olam, "System", `Macro: ${macro.name}`);
  for (const line of lines) executeCommand(olam, line, `macro:${macro.id}`);
  emitMacros(olam); return true;
}
export function assignMacroToSlot(olam, macroId, slot = 9) { const macro = ensureMacros(olam)?.macros.find(m => m.id === macroId); if (!macro) return false; return assignActionSlot(olam, slot, { type: "macro", macroId, name: macro.name, icon: macro.icon }); }
export function macroPayload(olam) { const state = ensureMacros(olam) || { macros: [] }; return { open: false, macros: state.macros }; }
export function emitMacros(olam, open = false) { const p = playerOf(olam); if (!p?.macroState) return false; const payload = { open, macros: p.macroState.macros }; olam?.ayshPeula?.("ui event", "macroPanel", payload); return payload; }
export function openMacros(olam) { olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "MACROS", color: "#d7c8ff" }); return emitMacros(olam, true); }
export default { ensureMacros, createMacro, runMacro, assignMacroToSlot, macroPayload, emitMacros, openMacros };
