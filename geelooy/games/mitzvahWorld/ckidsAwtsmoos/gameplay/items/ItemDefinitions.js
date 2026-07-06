// B"H
import { WEAPON_ARCHETYPES } from "../../platform/MitzvahPlatformCatalog.js";

export const ITEM_DEFINITIONS = {
  trainee_blade:{ id:"trainee_blade", name:"Training Knife", type:"weapon", slot:"weapon", weaponMode:"melee", weaponArchetype:"knife", rarity:"common", price:8, sellPrice:3, stats:{ power:2, dexterity:1 }, physical:WEAPON_ARCHETYPES.knife, icon:"TK" },
  walking_staff:{ id:"walking_staff", name:"Walking Staff", type:"weapon", slot:"weapon", weaponMode:"staff", weaponArchetype:"walkingStaff", rarity:"common", price:9, sellPrice:3, stats:{ power:2, wisdom:1 }, physical:WEAPON_ARCHETYPES.walkingStaff, icon:"WS" },
  garden_bow:{ id:"garden_bow", name:"Garden Bow", type:"weapon", slot:"weapon", weaponMode:"ranged", weaponArchetype:"bow", rarity:"fine", price:18, sellPrice:7, stats:{ power:3, range:18, dexterity:2 }, physical:WEAPON_ARCHETYPES.bow, icon:"GB" },
  learner_staff:{ id:"learner_staff", name:"Learner Magic Staff", type:"weapon", slot:"weapon", weaponMode:"magic", weaponArchetype:"magicStaff", rarity:"fine", price:22, sellPrice:8, stats:{ power:3, faith:2, chochmah:1 }, physical:WEAPON_ARCHETYPES.magicStaff, icon:"MS" },
  camp_axe:{ id:"camp_axe", name:"Camp Axe", type:"tool", slot:"tool", weaponMode:"axe", weaponArchetype:"axe", rarity:"sturdy", price:14, sellPrice:5, stats:{ woodcutting:2, strength:1 }, physical:WEAPON_ARCHETYPES.axe, icon:"AX" },
  shechita_knife:{ id:"shechita_knife", name:"Designated Harvest Knife", type:"tool", slot:"tool", weaponMode:"harvest", weaponArchetype:"shechitaKnife", rarity:"special", price:0, sellPrice:0, stats:{ dexterity:1, yirah:1 }, physical:WEAPON_ARCHETYPES.shechitaKnife, respectfulUse:true, icon:"DK" },
  field_pouch:{ id:"field_pouch", name:"Field Pouch", type:"bag", rarity:"sturdy", price:10, sellPrice:4, stats:{ slots:4 }, icon:"FP" },
  hide:{ id:"hide", name:"Soft Hide", type:"loot", rarity:"common", price:0, sellPrice:2, questItem:true, icon:"HD" },
  kosher_meat:{ id:"kosher_meat", name:"Usable Game Meat", type:"food", rarity:"common", price:0, sellPrice:3, stats:{ cookable:true }, icon:"KM" },
  kosher_poultry:{ id:"kosher_poultry", name:"Usable Poultry", type:"food", rarity:"common", price:0, sellPrice:3, stats:{ cookable:true }, icon:"KP" },
  feather:{ id:"feather", name:"Clean Feather", type:"loot", rarity:"common", price:0, sellPrice:2, questItem:true, icon:"FT" },
  wool_bundle:{ id:"wool_bundle", name:"Wool Bundle", type:"crafting", rarity:"common", price:0, sellPrice:2, icon:"WL" },
  small_horn:{ id:"small_horn", name:"Small Horn", type:"crafting", rarity:"common", price:0, sellPrice:2, icon:"HN" },
  antler:{ id:"antler", name:"Antler", type:"crafting", rarity:"common", price:0, sellPrice:3, icon:"AN" },
  apple:{ id:"apple", name:"Bright Apple", type:"food", rarity:"common", price:3, sellPrice:1, questItem:true, icon:"AP" },
  warm_bread:{ id:"warm_bread", name:"Warm Bread", type:"food", rarity:"common", price:4, sellPrice:1, stats:{ heal:12 }, icon:"WB" },
  guard_charm:{ id:"guard_charm", name:"Guardian Charm", type:"trinket", slot:"trinket", rarity:"fine", price:0, sellPrice:6, stats:{ stamina:4 }, icon:"GC" },
  boar_tusk:{ id:"boar_tusk", name:"Boar Tusk", type:"loot", rarity:"common", price:0, sellPrice:3, icon:"BT" },
  fox_tail:{ id:"fox_tail", name:"Fox Tail Tuft", type:"loot", rarity:"common", price:0, sellPrice:2, icon:"FX" }
};

export function itemDefinition(id) {
  return ITEM_DEFINITIONS[id] || { id, name:id, type:"misc", rarity:"common", price:0, sellPrice:0, icon:"?" };
}

export function createItemStack(id, qty = 1) {
  const def = itemDefinition(id);
  return { id:def.id, qty, name:def.name, type:def.type, rarity:def.rarity, price:def.price || 0, sellPrice:def.sellPrice || 0, icon:def.icon || "?" };
}
