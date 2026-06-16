// B"H
/** @file ProfessionRegistry.js @description Solo professions bound to existing Torah, farming, kosher, and halacha systems. */
export const ProfessionRegistry = Object.freeze([
  { id:"farming", name:"Farming", owners:["systems/farming/HarvestRuntime.js"] },
  { id:"cooking", name:"Cooking", owners:["systems/kosher/KosherProcessingRuntime.js"] },
  { id:"sofer", name:"Sofer", owners:["systems/kosher/TefillinCraftingRuntime.js"] },
  { id:"halacha", name:"Halacha Produce", owners:["systems/halacha/TerumahMaaserRuntime.js"] }
]);
export function professionById(id) { return ProfessionRegistry.find(p => p.id === id) || null; }
export default ProfessionRegistry;
