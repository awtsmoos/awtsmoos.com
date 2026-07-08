// B"H
/**
 * @file EquipmentRuntime.js
 * @description
 * Chapter 415: Vendor purchases now drink from the same wallet river as shops.
 */
import { hasBagItem, addBagItem, emitBag } from "../inventory/BagRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { itemById } from "../inventory/InventoryItemIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { awardMoney, moneyOf, walletPlayerOf } from "../economy/wallet/PersonalPerutaWallet.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureDurability } from "./DurabilityRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { equipmentStatPayload } from "./EquipmentStatRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function playerOf(olam) { return walletPlayerOf(olam); }
export function ensureEquipment(olam) { const p = playerOf(olam); if (!p) return null; p.inventory ||= { slots:[], actionSlots:[], equipment:{} }; p.inventory.equipment ||= {}; ensureDurability(olam); return p.inventory.equipment; }
export function buyItem(olam, itemId) { const item = itemById(itemId), p = playerOf(olam); if (!item || !p) return false; const price = Number(item.price || 0); if (moneyOf(p) < price) return false; awardMoney(p, -price, "equipment vendor buy"); addBagItem(olam, itemId); olam?.ayshPeula?.("ui event", "vendor", { bought:itemId, price, perutah:moneyOf(p), personalPerutas:moneyOf(p) }); return item; }
export function equipItem(olam, itemId, slotOverride = null) { const item = itemById(itemId) || (playerOf(olam)?.inventory?.slots || []).find(i => i.id === itemId || i.baseId === itemId); if (!item || !hasBagItem(olam, itemId)) return false; const eq = ensureEquipment(olam), slot = slotOverride || item.equipmentSlot || "tool"; eq[slot] = item.baseId || item.id; ensureDurability(olam); emitBag(olam); olam?.ayshPeula?.("ui event", "equipment", { equipped:itemId, slot, stats:equipmentStatPayload(olam) }); return item; }
export function unequipItem(olam, slot = "tool") { const eq = ensureEquipment(olam); if (!eq?.[slot]) return false; const old = eq[slot]; delete eq[slot]; emitBag(olam); olam?.ayshPeula?.("ui event", "equipment", { unequipped:old, slot }); return old; }
export function equippedItem(olam, slot = "tool") { const eq = ensureEquipment(olam); return eq?.[slot] || null; }
export function hasEquipped(olam, itemId, slot = "tool") { return equippedItem(olam, slot) === itemId; }
export function equipmentPayload(olam) { return equipmentStatPayload(olam); }
export default { ensureEquipment, buyItem, equipItem, unequipItem, equippedItem, hasEquipped, equipmentPayload };
