// B"H
export const NPCS = [
  { id:"guard_miriam", name:"Miriam the Garden Guard", role:"quest_giver", services:["quest"], marker:"gold!", x:42, y:40 },
  { id:"shop_yosef", name:"Yosef the Provisioner", role:"vendor", services:["vendor"], marker:"shop", x:72, y:48 },
  { id:"trainer_devora", name:"Devora the Trainer", role:"trainer", services:["trainer"], marker:"train", x:24, y:54 },
  { id:"villager_eli", name:"Eli the Villager", role:"villager", services:["dialogue"], marker:"talk", x:58, y:70 }
];

export function npcById(id) {
  return NPCS.find(npc => npc.id === id) || null;
}
