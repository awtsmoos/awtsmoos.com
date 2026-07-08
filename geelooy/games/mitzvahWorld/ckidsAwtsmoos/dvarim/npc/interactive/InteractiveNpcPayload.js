// B"H
/**
 * @file InteractiveNpcPayload.js
 * @description
 * Dialogue payload construction. The Awtsmoos turns a villager into a panel:
 * name, portrait, stats, shop, travel, missions, skills, and level gates.
 */
import { enrichedShop, enrichedSlots } from "./InteractiveNpcInventory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function initials(name = "NPC") {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "NPC";
}

export function portraitPayload(npc) {
  const base = npc.options.portrait || {};
  const name = npc.name || npc.options.title || "Village Guide";

  return {
    emoji: base.emoji || "🕍",
    image: base.image || base.url || "",
    name: base.name || name,
    title: base.title || npc.options.title || name,
    subtitle: base.subtitle || npc.options.areaName || npc.options.role || "Friendly NPC",
    initials: base.initials || initials(name),
    level: base.level || npc.options.level || 1
  };
}

export function npcOverlayPayload(npc, player) {
  return {
    fromNpc: npc.name,
    title: npc.options.title || "Village Guide",
    selectorTitle: npc.options.selectorTitle || "Choose Levels",
    lines: npc.dialogues,
    shopInventory: enrichedShop(player, npc.shopInventory),
    items: enrichedShop(player, npc.shopInventory),
    playerInventory: enrichedSlots(player),
    entityId: npc.id || npc.name,
    npcName: npc.name || "Village Guide",
    npcStats: npc.areaStats,
    areaStats: npc.areaStats,
    areaName: npc.options.areaName || "First Entry Village",
    areaNote: npc.options.areaNote || "Talk, choose levels, buy, sell, and grow.",
    role: npc.options.role || "Village Guide",
    opensLevelSelect: npc.options.opensLevelSelect !== false,
    hasShop: npc.options.hasShop !== false,
    travelPath: npc.options.travelPath || null,
    travelLabel: npc.options.travelLabel || null,
    travelOnly: Boolean(npc.options.travelOnly),
    missionId: npc.options.missionId || null,
    missionLabel: npc.options.missionLabel || null,
    learnSkillId: npc.options.learnSkillId || null,
    learnSkillLabel: npc.options.learnSkillLabel || null,
    visualRig: npc.visualRig,
    portrait: portraitPayload(npc),
    safePointerOverlay: true
  };
}
