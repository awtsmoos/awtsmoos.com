// B"H
/** @file TefillinCraftingRuntime.js @description Profession-aware tefillin crafting and selling through real bag/equipment item definitions. */
import { addBagItem, removeBagItem } from "../inventory/BagRuntime.js";
import { grantProfessionXp } from "../professions/ProfessionRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function slots(olam) { return playerOf(olam)?.inventory?.slots || []; }
function findBase(olam, baseId) { return slots(olam).find(i => i?.baseId === baseId || i?.id === baseId); }
function consumeBase(olam, baseId) { const item = findBase(olam, baseId); return item ? removeBagItem(olam, item.id || item.baseId) : false; }
export function canCraftTefillin(olam) { return Boolean(findBase(olam, "kosher_cow_leather") || findBase(olam, "tefillin_parchment")); }
export function craftTefillin(olam) { if (!findBase(olam, "kosher_cow_leather") && !findBase(olam, "tefillin_parchment")) return { ok:false, reason:"requires-kosher-leather-or-parchment" }; consumeBase(olam, "kosher_cow_leather"); consumeBase(olam, "tefillin_parchment"); const item = addBagItem(olam, { id:`tefillin_complete_${Date.now()}`, baseId:"tefillin_complete", name:"Tefillin", category:"Torah Artifacts", icon:"TEF", rarity:"rare", tefillin:true, sellValue:120 }); const xp = grantProfessionXp(olam, "sofer", 35); olam?.ayshPeula?.("ui event", "crafting", { ok:true, recipe:"tefillin", item, xp }); return { ok:true, item, xp }; }
export function sellTefillin(olam) { const p = playerOf(olam); if (!p) return { ok:false, reason:"no-player" }; const item = findBase(olam, "tefillin_complete"); if (!item) return { ok:false, reason:"no-tefillin" }; consumeBase(olam, "tefillin_complete"); p.perutah = Number(p.perutah || 0) + Number(item.sellValue || 120); olam?.ayshPeula?.("ui event", "vendor", { sold:"tefillin_complete", perutah:p.perutah }); return { ok:true, perutah:p.perutah }; }
export default { canCraftTefillin, craftTefillin, sellTefillin };
