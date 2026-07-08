// B"H
/** @file EquipmentStatRuntime.js @description Converts equipped items and durability into simple stat bonuses. */
import { itemById } from "../inventory/InventoryItemIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { ensureDurability } from "./DurabilityRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export function equipmentStatPayload(olam) { const p = playerOf(olam), eq = p?.inventory?.equipment || {}, durability = ensureDurability(olam) || {}; const bonuses = { armor:0, power:0, craft:0 }; for (const id of Object.values(eq)) { const item = itemById(id) || {}, row = durability[id] || { current:100, max:100 }, ratio = Math.max(0, Math.min(1, Number(row.current || 0) / Number(row.max || 100))); bonuses.armor += Math.floor(Number(item.armor || 0) * ratio); bonuses.power += Math.floor(Number(item.power || 0) * ratio); bonuses.craft += Math.floor(Number(item.craft || 0) * ratio); } return { equipment:eq, durability, bonuses }; }
export default { equipmentStatPayload };
