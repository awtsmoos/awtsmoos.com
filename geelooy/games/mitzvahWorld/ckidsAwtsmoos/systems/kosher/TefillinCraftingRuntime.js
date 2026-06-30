// B"H
/**
 * @file TefillinCraftingRuntime.js
 * @description
 * Chapter 418: The sofer sale now pays the same personal wallet as every mitzvah market.
 */
import { addBagItem, removeBagItem } from "../inventory/BagRuntime.js";
import { awardMoney, moneyOf, walletPlayerOf } from "../economy/wallet/PersonalPerutaWallet.js";
import { grantProfessionXp } from "../professions/ProfessionRuntime.js";

function playerOf(olam) { return walletPlayerOf(olam); }
function slots(olam) { return playerOf(olam)?.inventory?.slots || []; }
function findBase(olam, baseId) { return slots(olam).find(i => i?.baseId === baseId || i?.id === baseId); }
function consumeBase(olam, baseId) { const item = findBase(olam, baseId); return item ? removeBagItem(olam, item.id || item.baseId) : false; }
export function canCraftTefillin(olam) { return Boolean(findBase(olam, "kosher_cow_leather") || findBase(olam, "tefillin_parchment")); }
export function craftTefillin(olam) { if (!findBase(olam, "kosher_cow_leather") && !findBase(olam, "tefillin_parchment")) return { ok:false, reason:"requires-kosher-leather-or-parchment" }; consumeBase(olam, "kosher_cow_leather"); consumeBase(olam, "tefillin_parchment"); const item = addBagItem(olam, { id:`tefillin_complete_${Date.now()}`, baseId:"tefillin_complete", name:"Tefillin", category:"Torah Artifacts", icon:"TEF", rarity:"rare", tefillin:true, sellValue:120 }); const xp = grantProfessionXp(olam, "sofer", 35); olam?.ayshPeula?.("ui event", "crafting", { ok:true, recipe:"tefillin", item, xp }); return { ok:true, item, xp }; }
export function sellTefillin(olam) { const p = playerOf(olam); if (!p) return { ok:false, reason:"no-player" }; const item = findBase(olam, "tefillin_complete"); if (!item) return { ok:false, reason:"no-tefillin" }; consumeBase(olam, "tefillin_complete"); const perutah = awardMoney(p, Number(item.sellValue || 120), "tefillin sale"); olam?.ayshPeula?.("ui event", "vendor", { sold:"tefillin_complete", perutah, personalPerutas:perutah }); return { ok:true, perutah:moneyOf(p) }; }
export default { canCraftTefillin, craftTefillin, sellTefillin };
