// B"H
/** @file InventoryItemIndex.js @description MMO item index for sefarim, keys, kosher craft, farm produce, rewards, food, tools, and quest items. */
import { SeferIds, seferItem } from "../../tochen/torah/SeferIndex.js";
import { KeyRegistry, keyItem } from "../locks/KeyRegistry.js";
export const BAG_CATEGORIES = Object.freeze(["Sefarim", "Quest Items", "Materials", "Food", "Equipment", "Torah Artifacts"]);
const keyItems = Object.fromEntries(Object.keys(KeyRegistry).map(id => [id, keyItem(id)]));
const baseItems = {
  spark_fragment: { id:"spark_fragment", name:"Spark Fragment", category:"Torah Artifacts", icon:"SPARK", sellValue:1 },
  siddur_page: { id:"siddur_page", name:"Loose Siddur Page", category:"Quest Items", icon:"PAGE" },
  traveler_letter: { id:"traveler_letter", name:"Traveler Letter", category:"Quest Items", icon:"MAIL" },
  healing_herb: { id:"healing_herb", name:"Healing Herb", category:"Food", icon:"HERB", price:5, sellValue:1, food:true },
  bridge_wood: { id:"bridge_wood", name:"Bridge Wood", category:"Materials", icon:"WOOD", price:3, sellValue:1 },
  fox_cloak_thread: { id:"fox_cloak_thread", name:"White Fox Cloak Thread", category:"Equipment", icon:"THREAD", price:30, sellValue:9 },
  tevel_wheat_bundle: { id:"tevel_wheat_bundle", name:"Tevel Wheat Bundle", category:"Materials", icon:"WHEAT", produceStatus:{ crop:"wheat", tevel:true, separated:false } },
  separated_wheat_bundle: { id:"separated_wheat_bundle", name:"Separated Wheat Bundle", category:"Materials", icon:"WHEAT", produceStatus:{ crop:"wheat", tevel:false, separated:true } },
  terumah_portion_token: { id:"terumah_portion_token", name:"Terumah Portion Token", category:"Quest Items", icon:"TERUMAH" },
  maaser_ani_basket: { id:"maaser_ani_basket", name:"Maaser Ani Basket", category:"Quest Items", icon:"BASKET" },
  shechita_knife: { id:"shechita_knife", name:"Shechita Knife", category:"Equipment", icon:"KNF", equipmentSlot:"tool", kosherTool:true, price:48, sellValue:14, power:1, description:"Educational game tool. Requires proper use in the kosher-processing minigame." },
  basar_shechuta: { id:"basar_shechuta", name:"Basar Shechuta", category:"Food", icon:"MEAT", kosherMeat:true, sellValue:9, description:"Kosher meat produced only through the shechita-knife gameplay check." },
  non_kosher_meat: { id:"non_kosher_meat", name:"Non-Kosher Meat", category:"Food", icon:"MEAT?", kosherMeat:false, sellValue:1, description:"Game output when the kosher requirements were not met." },
  cow_hide: { id:"cow_hide", name:"Cow Hide", category:"Materials", icon:"HIDE", animalMaterial:true, sellValue:4 },
  kosher_cow_leather: { id:"kosher_cow_leather", name:"Kosher Cow Leather", category:"Materials", icon:"LEATHER", kosherLeather:true, tefillinReady:true, sellValue:14 },
  fur_scrap: { id:"fur_scrap", name:"Fur Scrap", category:"Materials", icon:"FUR", animalMaterial:true, sellValue:2 },
  tefillin_parchment: { id:"tefillin_parchment", name:"Tefillin Parchment", category:"Torah Artifacts", icon:"KLAF", tefillinPart:true, sellValue:25 },
  tefillin_batim: { id:"tefillin_batim", name:"Tefillin Batim", category:"Torah Artifacts", icon:"BATIM", tefillinPart:true, sellValue:30 },
  tefillin_complete: { id:"tefillin_complete", name:"Tefillin", category:"Torah Artifacts", icon:"TEF", tefillin:true, sellValue:120, description:"Crafted educationally from kosher leather and parchment components." },
  hearty_meal: { id:"hearty_meal", name:"Hearty Meal", category:"Food", icon:"MEAL", price:12, sellValue:4, food:true },
  kosher_bread: { id:"kosher_bread", name:"Kosher Bread", category:"Food", icon:"BREAD", price:8, sellValue:3, food:true },
  pilgrim_cloak: { id:"pilgrim_cloak", name:"Pilgrim Cloak", category:"Equipment", icon:"CLOAK", armor:3, price:40, sellValue:12, equipmentSlot:"back" },
  village_friend: { id:"village_friend", name:"Village Friend Token", category:"Quest Items", icon:"FRIEND", sellValue:0 },
  sturdy_watering_can: { id:"sturdy_watering_can", name:"Sturdy Watering Can", category:"Equipment", icon:"CAN", craft:2, price:25, sellValue:7, equipmentSlot:"tool" },
  ink_discount: { id:"ink_discount", name:"Ink Discount Token", category:"Quest Items", icon:"INK", sellValue:0 }
};
export const InventoryItemIndex = Object.freeze({ ...Object.fromEntries(SeferIds.map(id => [`sefer_${id}`, seferItem(id)])), ...keyItems, ...baseItems });
export function itemById(id) { return InventoryItemIndex[id] || null; }
export function categoryOf(item) { return item?.category || "Materials"; }
export default InventoryItemIndex;
