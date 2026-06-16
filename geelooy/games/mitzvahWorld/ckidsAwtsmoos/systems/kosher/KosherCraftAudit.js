// B"H
/** @file KosherCraftAudit.js @description Behavioral audit for cow/carcass/shechita-facing/leather/tefillin loop. */
import { itemById } from "../inventory/InventoryItemIndex.js";
import { animalKosherData } from "./KosherAnimalIndex.js";
import { createCarcass } from "./CarcassRuntime.js";
import { canKosherProcess, processCarcass } from "./KosherProcessingRuntime.js";
import { buyItem, equipItem } from "../equipment/EquipmentRuntime.js";
import { craftTefillin, sellTefillin } from "./TefillinCraftingRuntime.js";
export function runKosherCraftAudit() {
  const events = [], cow = { name:"cow_audit", position:{ x:0, y:0, z:4 }, userData:{ species:"cow", health:{ dead:true }, motion:{ id:"cow_audit" } } }, player = { perutah:200, inventory:{ slots:[], actionSlots:[], equipment:{} }, mesh:{ position:{ x:0, y:0, z:0 }, rotation:{ y:Math.PI } }, __awtsmoosUnifiedFacingYaw:Math.PI }, olam = { player, nivrayim:[cow], ayshPeula:(...a)=>events.push(a) };
  const itemsOk = ["shechita_knife", "basar_shechuta", "kosher_cow_leather", "tefillin_complete"].every(id => itemById(id));
  const data = animalKosherData("cow"), carcass = createCarcass(olam, cow), blocked = canKosherProcess(olam, carcass), bought = buyItem(olam, "shechita_knife"), equipped = equipItem(olam, "shechita_knife"), processed = processCarcass(olam, carcass, "leather"), crafted = craftTefillin(olam), sold = sellTefillin(olam);
  const ids = player.inventory.slots.map(i => i.id || i.baseId);
  return { ok:itemsOk && data.kosherSpecies && blocked.reason === "requires-equipped-shechita-knife" && Boolean(bought) && Boolean(equipped) && processed.ok && crafted.ok && sold.ok, itemsOk, cowKosher:data.kosherSpecies, blockedBeforeKnife:blocked.reason, equipped:player.inventory.equipment.tool, processed:processed.ok, crafted:crafted.ok, sold:sold.ok, ids, perutah:player.perutah, events:events.length };
}
export default { runKosherCraftAudit };
