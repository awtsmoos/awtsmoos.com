// B"H
/** @file NpcServiceRegistry.js @description Starter NPC service truth: the village speaks through clear gossip, quests, trainers, vendors, inn, bank, mail, repair, profession, and guard roles. */
export const NpcServiceRegistry = Object.freeze([
  { id:"rebbe", name:"Rebbe", aliases:["Rebbe"], services:["quest","trainer"], trainerId:"rebbe_trainer", quests:["the_first_shliach","learn_shema","the_rebbes_first_mission"], greeting:"B\"H, young shliach. The first sparks are waiting in the village." },
  { id:"librarian", name:"Librarian", aliases:["Librarian"], services:["quest"], quests:["lost_sefarim"], greeting:"Pages of Torah have scattered; gather them with care." },
  { id:"melamed", name:"Melamed", aliases:["Melamed","Forest Melamed"], services:["quest","trainer"], trainerId:"melamed_trainer", quests:["calm_the_forest","learn_tanya"], greeting:"Every creature can be calmed when the lesson is clear." },
  { id:"guard", name:"Village Guard", aliases:["Village Guard"], services:["quest","guard"], quests:["village_protection","the_fox_den","the_cave_warning"], greeting:"Stay near the road until you know your strength." },
  { id:"toolmaker", name:"Toolmaker", aliases:["Toolmaker"], services:["quest","vendor","repair"], vendorId:"toolmaker", quests:["build_the_bridge"], greeting:"A tool in good repair turns danger into service." },
  { id:"innkeeper", name:"Innkeeper", aliases:["Innkeeper"], services:["inn","hearth"], innId:"village_inn", greeting:"Bind your hearth and rest your koach before the road." },
  { id:"banker", name:"Storehouse Keeper", aliases:["Banker","Storehouse Keeper"], services:["bank"], greeting:"What is precious can be guarded in the village storehouse." },
  { id:"post_shliach", name:"Post Shliach", aliases:["Scribe","Post Shliach"], services:["quest","mailbox"], quests:["letters_to_deliver"], greeting:"Letters travel farther than feet when sent with purpose." },
  { id:"sofer", name:"Scribe", aliases:["Scribe"], services:["trainer","profession","mailbox"], trainerId:"sofer_trainer", greeting:"Ink, leather, and letters become holy vessels." },
  { id:"healer", name:"Healer", aliases:["Healer"], services:["quest","vendor"], vendorId:"healer", quests:["healing_herbs"], greeting:"Bring herbs, and learn how care restores life." },
  { id:"farmer", name:"Farmer", aliases:["Farmer"], services:["quest","profession"], quests:["farmers_trouble"], greeting:"The field answers the one who plants, waters, and separates." }
]);
export function npcById(id) { return NpcServiceRegistry.find(n => n.id === id || n.aliases?.includes(id)) || null; }
export function npcForGiver(giver) { return NpcServiceRegistry.find(n => n.aliases?.includes(giver) || n.name === giver || n.id === giver) || null; }
export function npcServices() { return NpcServiceRegistry.slice(); }
export default NpcServiceRegistry;
