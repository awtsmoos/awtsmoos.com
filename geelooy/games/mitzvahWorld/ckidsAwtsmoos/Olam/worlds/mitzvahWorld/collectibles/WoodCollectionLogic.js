// B"H
/** @file WoodCollectionLogic.js @description Wood collection runtime exports preserved for all import paths. */
function dataOf(group) {
  return group && group.userData ? group.userData : {};
}

function actorInventory(actor) {
  return actor && actor.inventory ? actor.inventory : null;
}

function addWood(actor, amount) {
  const inventory = actorInventory(actor);
  if (inventory && typeof inventory.addItem === "function") inventory.addItem({ id:"wood", className:"Wood", name:"Wood", icon:"wood" }, amount);
}

function quest(actor) {
  if (actor && typeof actor.updateQuestProgress === "function") actor.updateQuestProgress("collect", "Wood");
}

function overlay(olam, amount) {
  if (olam && typeof olam.ayshPeula === "function") olam.ayshPeula("ui event", "effectsOverlay", { text:`+${amount} wood`, color:"#d79a48" });
}

function normalizeArgs(groupOrOptions, actor, olam, amount) {
  if (groupOrOptions && typeof groupOrOptions === "object" && ("group" in groupOrOptions || "actor" in groupOrOptions || "collectibleId" in groupOrOptions)) {
    return { group:groupOrOptions.group, actor:groupOrOptions.actor, olam:groupOrOptions.olam, amount:Number(groupOrOptions.amount || 1), collectibleId:groupOrOptions.collectibleId || groupOrOptions.group?.userData?.collectibleId || "wood" };
  }
  return { group:groupOrOptions, actor, olam, amount:Number(amount || 1), collectibleId:groupOrOptions?.userData?.collectibleId || "wood" };
}

export function collectWood(groupOrOptions, actor, olam, amount = 1) {
  const input = normalizeArgs(groupOrOptions, actor, olam, amount);
  const data = dataOf(input.group);
  if (data.collected) return { collected:false, collectibleId:input.collectibleId, amount:0 };
  data.collected = true;
  if (input.group) input.group.visible = false;
  addWood(input.actor, input.amount);
  quest(input.actor);
  overlay(input.olam, input.amount);
  return { collected:true, collectibleId:input.collectibleId, amount:input.amount };
}

export const collectWoodRuntime = collectWood;
export default collectWood;
