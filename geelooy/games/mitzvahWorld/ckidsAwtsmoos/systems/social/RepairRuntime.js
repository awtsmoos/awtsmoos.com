// B"H
/** @file RepairRuntime.js @description Repairs mission props and real equipment durability. */
import { repairDurability, repairCost } from "../equipment/DurabilityRuntime.js";
export function repairThing(olam, id = "thing") { olam.__repairs ||= {}; olam.__repairs[id] = Date.now(); olam?.ayshPeula?.("ui event", "effectsOverlay", { text:`Repaired ${id}`, color:"#76ff8a" }); return { id, repaired:true }; }
export function repairEquipment(olam, itemId = null) { return repairDurability(olam, itemId); }
export function repairPayload(olam) { return { cost:repairCost(olam), repairs:olam.__repairs || {} }; }
export default { repairThing, repairEquipment, repairPayload };
