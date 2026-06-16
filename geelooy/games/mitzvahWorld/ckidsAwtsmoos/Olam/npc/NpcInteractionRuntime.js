// B"H
/**
 * @file NpcInteractionRuntime.js
 * @description
 * Chapter: The silent NPC finally receives a mouth.
 *
 * A worker was boxing the whole world inside a fatal import because this
 * module-path was expected by the Olam vessel but had no exported covenant.
 * The Awtsmoos, creating speech from nothing every instant, lets a missing
 * file become a bridge: talk, quest, shop, give, repair, rent, and return.
 */

const DEFAULT_LINE = "Shalom! The road is open, and every step can become a mitzvah.";

function nameOf(npc) {
  return npc?.displayName || npc?.name || npc?.userData?.displayName || npc?.userData?.name || "Village Guide";
}

function linesOf(npc) {
  const raw = npc?.dialogue || npc?.dialog || npc?.talkLines || npc?.userData?.dialogue;
  if (Array.isArray(raw) && raw.length) return raw.map(String);
  if (typeof raw === "string" && raw.trim()) return [raw.trim()];
  return [DEFAULT_LINE];
}

function emit(olam, type, detail) {
  try { olam?.uiManager?.sendUiEvent?.({ shaym: type, ob: detail }); } catch {}
  try { olam?.dispatchEvent?.({ type, detail }); } catch {}
  try { globalThis.postMessage?.({ npcInteraction: { type, detail } }); } catch {}
}

export function performTalk({ olam = null, npc = null, player = null, lineIndex = 0 } = {}) {
  const lines = linesOf(npc);
  const line = lines[Math.max(0, Math.min(lines.length - 1, lineIndex))] || DEFAULT_LINE;
  const result = { ok: true, action: "talk", npcName: nameOf(npc), line, lines, player };
  emit(olam, "npcTalk", result);
  return result;
}

export function performQuest({ olam = null, npc = null, quest = null, player = null } = {}) {
  const result = { ok: true, action: "quest", npcName: nameOf(npc), quest, player };
  emit(olam, "npcQuest", result);
  return result;
}

export function performShop({ olam = null, npc = null, items = [] } = {}) {
  const result = { ok: true, action: "shop", npcName: nameOf(npc), items };
  emit(olam, "npcShop", result);
  return result;
}

export function performGive({ olam = null, npc = null, item = null, player = null } = {}) {
  const result = { ok: true, action: "give", npcName: nameOf(npc), item, player };
  emit(olam, "npcGive", result);
  return result;
}

export function performRepair({ olam = null, npc = null, target = null } = {}) {
  if (target && typeof target === "object" && "durability" in target) target.durability = 100;
  const result = { ok: true, action: "repair", npcName: nameOf(npc), target };
  emit(olam, "npcRepair", result);
  return result;
}

export function performRent({ olam = null, npc = null, vehicle = null, ownerId = "player" } = {}) {
  if (vehicle && typeof vehicle === "object") { vehicle.ownerId = ownerId; vehicle.rented = true; }
  const result = { ok: true, action: "rent", npcName: nameOf(npc), vehicle, ownerId };
  emit(olam, "npcRent", result);
  return result;
}

export default { performTalk, performQuest, performShop, performGive, performRepair, performRent };
