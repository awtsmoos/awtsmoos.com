// B"H
/** @file BagRuntime.js @description Inventory bags with categories, quantities, rarity, equipment hints, and UI payloads. */
import { BAG_CATEGORIES, itemById, InventoryItemIndex } from "./InventoryItemIndex.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function emit(olam, name, payload) { olam?.ayshPeula?.("ui event", name, payload); }
function cloneItem(itemOrId) { const item = typeof itemOrId === "string" ? itemById(itemOrId) : itemOrId; if (!item) return null; return { qty:1, rarity:item.rarity || "common", ...item, id:item.id || `${item.baseId || "item"}_${Date.now()}` }; }
function baseOf(item = {}) { return item.baseId || item.id; }
export function ensureBag(olam) { const p = playerOf(olam); if (!p) return null; p.inventory ||= { slots:[], actionSlots:[], equipment:{} }; p.inventory.slots ||= []; p.inventory.equipment ||= {}; p.bag ||= { openedAt:0, categories:BAG_CATEGORIES }; return p.inventory; }
function hasBagItemRaw(player, itemId) { return (player?.inventory?.slots || []).some(i => i?.id === itemId || i?.baseId === itemId); }
export function hasBagItem(olam, itemId) { const p = playerOf(olam); ensureBag(olam); return hasBagItemRaw(p, itemId); }
export function addBagItem(olam, itemOrId, options = {}) { const inv = ensureBag(olam); if (!inv) return null; const item = cloneItem(itemOrId); if (!item) return null; const stack = inv.slots.find(i => (i.stackable || item.stackable) && baseOf(i) === baseOf(item)); if (stack) stack.qty = Number(stack.qty || 1) + Number(item.qty || 1); else inv.slots.push(item); if (!options.silent) emitBag(olam); return item; }
export function removeBagItem(olam, itemId, qty = 1) { const inv = ensureBag(olam); if (!inv) return false; const i = inv.slots.findIndex(x => x?.id === itemId || x?.baseId === itemId); if (i < 0) return false; const item = inv.slots[i]; item.qty = Number(item.qty || 1) - Math.max(1, qty); if (item.qty <= 0) inv.slots.splice(i, 1); emitBag(olam); return item; }
export function bagPayload(olam) { const inv = ensureBag(olam) || { slots:[], equipment:{} }; const categories = Object.fromEntries(BAG_CATEGORIES.map(c => [c, []])); for (const item of inv.slots) { const cat = item?.category || "Materials"; (categories[cat] ||= []).push(item); } return { slots:inv.slots, categories, equipment:inv.equipment, itemIndexCount:Object.keys(InventoryItemIndex).length }; }
export function emitBag(olam, open = false) { const payload = bagPayload(olam); payload.open = open; emit(olam, "bagState", payload); return payload; }
export function openBag(olam) { const p = playerOf(olam); ensureBag(olam); if (p?.bag) p.bag.openedAt = Date.now(); emit(olam, "effectsOverlay", { text:"BAG", color:"#ffd966" }); return emitBag(olam, true); }
export default { ensureBag, hasBagItem, addBagItem, removeBagItem, bagPayload, emitBag, openBag };
