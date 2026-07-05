// B"H
/** @file KidQuestCatalog.js @description Kid-friendly NPC quest catalog. */
export const KID_QUESTS = Object.freeze([
  Object.freeze({
    id:"jill_gifts",
    npcName:"Jill",
    title:"Jill's Missing Gifts",
    offer:"Oh no! I misplaced 3 little gifts. Can you bring them back?",
    objective:{ type:"collect", itemId:"gift_token", count:3 },
    reward:{ perutah:5, mitzvahPoints:1 }
  }),
  Object.freeze({
    id:"reb_avraham_deer_tokens",
    npcName:"Reb Avraham",
    title:"Gentle Field Lesson",
    offer:"Bring back 2 antler tokens dropped from deer.",
    objective:{ type:"collect", itemId:"deer_antler", count:2 },
    reward:{ perutah:8, mitzvahPoints:2 }
  }),
  Object.freeze({
    id:"miriam_feathers",
    npcName:"Miriam",
    title:"Feathers for the Craft Table",
    offer:"Can you find 4 feathers?",
    objective:{ type:"collect", itemId:"feather", count:4 },
    reward:{ gift_token:1 }
  })
]);

export function questById(id) { return KID_QUESTS.find(q => q.id === id) || null; }
export function questForNpc(name) { return KID_QUESTS.find(q => q.npcName === name) || null; }

export default { KID_QUESTS, questById, questForNpc };
