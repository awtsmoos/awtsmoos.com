// B"H
/**
 * @file DurabilityRuntime.js
 * @description
 * Chapter 416: Repairs now charge the one personal purse and mirror legacy UI.
 */
import { itemById } from "../inventory/InventoryItemIndex.js";
import { awardMoney, moneyOf, walletPlayerOf } from "../economy/wallet/PersonalPerutaWallet.js";

function playerOf(olam) { return walletPlayerOf(olam); }
function equipmentOf(olam) { const p = playerOf(olam); if (!p) return {}; p.inventory ||= { slots:[], actionSlots:[], equipment:{} }; p.inventory.equipment ||= {}; return p.inventory.equipment; }
export function ensureDurability(olam) { const p = playerOf(olam); if (!p) return null; p.durability ||= {}; const eq = equipmentOf(olam); for (const itemId of Object.values(eq)) if (itemId && !p.durability[itemId]) p.durability[itemId] = { itemId, current:100, max:100 }; return p.durability; }
export function wearEquipped(olam, amount = 1, slot = null) { const eq = equipmentOf(olam), d = ensureDurability(olam); if (!d) return []; const ids = slot ? [eq[slot]].filter(Boolean) : Object.values(eq).filter(Boolean); return ids.map(id => { d[id] ||= { itemId:id, current:100, max:100 }; d[id].current = Math.max(0, Number(d[id].current || 0) - Math.max(0, amount)); return d[id]; }); }
export function repairCost(olam, itemId = null) { const d = ensureDurability(olam) || {}, ids = itemId ? [itemId] : Object.keys(d); return ids.reduce((sum, id) => { const row = d[id], item = itemById(id) || {}; const missing = Math.max(0, Number(row?.max || 100) - Number(row?.current || 0)); return sum + Math.ceil(missing * Math.max(1, Number(item.price || item.sellValue || 5)) / 100); }, 0); }
export function repairDurability(olam, itemId = null) { const p = playerOf(olam), d = ensureDurability(olam); if (!p || !d) return false; const cost = repairCost(olam, itemId); if (moneyOf(p) < cost) return { ok:false, reason:"low-perutah", cost, perutah:moneyOf(p) }; awardMoney(p, -cost, "repair durability"); const ids = itemId ? [itemId] : Object.keys(d); for (const id of ids) if (d[id]) d[id].current = d[id].max || 100; olam?.ayshPeula?.("ui event", "repair", { ok:true, itemId, cost, durability:d, perutah:moneyOf(p), personalPerutas:moneyOf(p) }); return { ok:true, cost, durability:d, perutah:moneyOf(p) }; }
export default { ensureDurability, wearEquipped, repairCost, repairDurability };
