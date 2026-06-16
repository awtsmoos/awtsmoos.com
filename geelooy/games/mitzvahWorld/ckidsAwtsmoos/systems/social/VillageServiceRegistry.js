// B"H
/** @file VillageServiceRegistry.js @description Village social-service anchors. */
export const VillageServiceRegistry = Object.freeze([
  { id: "inn", title: "Innkeeper", npcRole: "innkeeper", service: "rest" },
  { id: "bank", title: "Storehouse Chest", npcRole: "grocer", service: "bank" },
  { id: "mail", title: "Letter Post", npcRole: "scribe", service: "mail" },
  { id: "repair", title: "Toolmaker Repair", npcRole: "toolmaker", service: "repair" },
  { id: "vendor", title: "Village Vendor", npcRole: "baker", service: "vendor" }
]);
export default VillageServiceRegistry;
