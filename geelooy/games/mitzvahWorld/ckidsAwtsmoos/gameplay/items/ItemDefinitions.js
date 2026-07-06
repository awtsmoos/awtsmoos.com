// B"H
export const ITEM_DEFINITIONS = {
  trainee_blade:{ id:"trainee_blade", name:"Trainee Blade", type:"weapon", slot:"weapon", weaponMode:"melee", rarity:"common", price:8, sellPrice:3, stats:{ power:2 }, icon:"TB" },
  garden_bow:{ id:"garden_bow", name:"Garden Bow", type:"weapon", slot:"weapon", weaponMode:"ranged", rarity:"fine", price:18, sellPrice:7, stats:{ power:3, range:18 }, icon:"GB" },
  field_pouch:{ id:"field_pouch", name:"Field Pouch", type:"bag", rarity:"sturdy", price:10, sellPrice:4, stats:{ slots:4 }, icon:"FP" },
  hide:{ id:"hide", name:"Soft Hide", type:"loot", rarity:"common", price:0, sellPrice:2, questItem:true, icon:"HD" },
  feather:{ id:"feather", name:"Clean Feather", type:"loot", rarity:"common", price:0, sellPrice:2, questItem:true, icon:"FT" },
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
