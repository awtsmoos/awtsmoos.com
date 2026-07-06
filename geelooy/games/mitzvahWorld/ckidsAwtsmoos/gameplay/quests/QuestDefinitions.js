// B"H
export const QUEST_CHAIN = [
  {
    id:"clear_the_garden",
    title:"Clear the Garden",
    giverId:"guard_miriam",
    markerAvailable:"gold-exclamation",
    objective:{ type:"kill", target:["fox", "goat", "boar"], count:3, label:"Defeat garden pests" },
    rewards:{ xp:35, coins:8, items:["trainee_blade"] },
    next:"gather_kindness_tokens"
  },
  {
    id:"gather_kindness_tokens",
    title:"Gather Kindness Tokens",
    giverId:"guard_miriam",
    objective:{ type:"collect", target:["hide", "feather", "apple"], count:2, label:"Collect useful drops" },
    rewards:{ xp:40, coins:5, items:["field_pouch"] },
    next:"brave_the_guardian"
  },
  {
    id:"brave_the_guardian",
    title:"Brave the Guardian",
    giverId:"guard_miriam",
    objective:{ type:"kill", target:["guardian_ram"], count:1, label:"Defeat the guardian ram" },
    rewards:{ xp:70, coins:12, items:["garden_bow", "guard_charm"] },
    next:null
  }
];

export function questById(id) {
  return QUEST_CHAIN.find(quest => quest.id === id) || null;
}
