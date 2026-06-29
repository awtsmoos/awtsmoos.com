// B"H
import assert from "node:assert/strict";
import { addBagItem, bagPayload } from "../../ckidsAwtsmoos/systems/inventory/BagRuntime.js";
import { equipItem, equipmentPayload, hasEquipped, unequipItem } from "../../ckidsAwtsmoos/systems/equipment/EquipmentRuntime.js";
import { repairCost, repairDurability, wearEquipped } from "../../ckidsAwtsmoos/systems/equipment/DurabilityRuntime.js";

const events = [];
const player = { id:"player", perutah:100, inventory:{ slots:[], actionSlots:[], equipment:{} } };
const olam = { player, chossid:player, ayshPeula:(kind, name, payload) => events.push({ kind, name, payload }) };

addBagItem(olam, "pilgrim_cloak", { silent:true });
addBagItem(olam, "sturdy_watering_can", { silent:true });

assert.equal(equipItem(olam, "pilgrim_cloak", "back")?.id, "pilgrim_cloak", "cloak should equip to wardrobe/back slot");
assert.equal(equipItem(olam, "sturdy_watering_can", "tool")?.id, "sturdy_watering_can", "tool should equip");
assert.equal(hasEquipped(olam, "pilgrim_cloak", "back"), true, "back slot should report cloak equipped");

const stats = equipmentPayload(olam);
assert.equal(stats.equipment.back, "pilgrim_cloak", "equipment payload should include cloak");
assert.equal(stats.equipment.tool, "sturdy_watering_can", "equipment payload should include tool");
assert.equal(stats.bonuses.armor >= 3, true, "cloak armor should count");
assert.equal(stats.bonuses.craft >= 2, true, "tool craft should count");

wearEquipped(olam, 40, "back");
assert.equal(repairCost(olam, "pilgrim_cloak") > 0, true, "worn cloak should have repair cost");
assert.equal(repairDurability(olam, "pilgrim_cloak").ok, true, "repair should succeed with wallet");
assert.equal(unequipItem(olam, "back"), "pilgrim_cloak", "unequip should return old item id");
assert.equal(hasEquipped(olam, "pilgrim_cloak", "back"), false, "back slot should be empty after unequip");
assert.equal(bagPayload(olam).slots.length >= 2, true, "wardrobe items stay in bag slots");
assert.equal(events.some(e => e.name === "equipment"), true, "equipment UI events should emit");

console.log(JSON.stringify({ ok:true, test:"wardrobeEquipmentEndToEndAudit", slots:bagPayload(olam).slots.length, events:events.length }, null, 2));
