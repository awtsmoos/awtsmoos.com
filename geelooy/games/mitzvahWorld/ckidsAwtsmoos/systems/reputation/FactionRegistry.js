// B"H
/** @file FactionRegistry.js @description Solo reputation factions that reward one player for living in the world. */
export const FactionRegistry = Object.freeze([
  { id:"yerushalayim", name:"Yerushalayim", discounts:["vendor"], rewards:["pilgrim_cloak"] },
  { id:"village", name:"Starting Village", discounts:["repair", "inn"], rewards:["village_friend"] },
  { id:"sofer_guild", name:"Sofer Guild", discounts:["scribe"], rewards:["ink_discount"] },
  { id:"farmers_guild", name:"Farmers Guild", discounts:["seed"], rewards:["sturdy_watering_can"] }
]);
export function factionById(id) { return FactionRegistry.find(f => f.id === id) || null; }
export default FactionRegistry;
