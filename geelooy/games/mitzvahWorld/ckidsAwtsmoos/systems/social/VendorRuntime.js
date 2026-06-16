// B"H
/** @file VendorRuntime.js @description Stateful solo vendor: stock, buy, sell-memory, buyback payload, and repair access. */
import { itemById } from "../inventory/InventoryItemIndex.js";
import { addBagItem } from "../inventory/BagRuntime.js";
import { stockFor } from "./VendorStockRegistry.js";
import { priceFor } from "./PriceRuntime.js";
import { noteSoldItem, buybackPayload } from "./BuybackRuntime.js";
import { repairDurability, repairCost } from "../equipment/DurabilityRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function emit(olam, name, payload) { olam?.ayshPeula?.("ui event", name, payload); }
export function vendorItems(olam, vendorId = "vendor") { const p = playerOf(olam); return stockFor(vendorId).map(id => { const item = itemById(id); return item ? { ...item, price:priceFor(p, item, "buy", "village") } : null; }).filter(Boolean); }
export function openVendor(olam, vendorId = "vendor") { const payload = { open:true, vendorId, items:vendorItems(olam, vendorId), buyback:buybackPayload(olam).items, repairCost:repairCost(olam) }; emit(olam, "storeScreen", payload); return payload; }
export function buyVendorItem(olam, itemId, vendorId = "vendor") { const p = playerOf(olam), item = itemById(itemId); if (!p || !item || !stockFor(vendorId).includes(itemId)) return { ok:false, reason:"not-for-sale" }; p.perutah = Number(p.perutah || 0); const price = priceFor(p, item, "buy", "village"); if (p.perutah < price) return { ok:false, reason:"low-perutah", price, perutah:p.perutah }; p.perutah -= price; addBagItem(olam, itemId); emit(olam, "vendor", { bought:itemId, price, perutah:p.perutah }); return { ok:true, itemId, price, perutah:p.perutah }; }
export function sellVendorItem(olam, itemId) { const p = playerOf(olam), item = itemById(itemId); if (!p || !item) return { ok:false, reason:"unknown-item" }; p.perutah = Number(p.perutah || 0); const value = priceFor(p, item, "sell", "village"); p.perutah += value; noteSoldItem(olam, item, value); emit(olam, "vendor", { sold:itemId, value, perutah:p.perutah }); return { ok:true, itemId, value, perutah:p.perutah }; }
export function repairAtVendor(olam, itemId = null) { const result = repairDurability(olam, itemId); openVendor(olam, "toolmaker"); return result; }
export default { openVendor, vendorItems, buyVendorItem, sellVendorItem, repairAtVendor };
