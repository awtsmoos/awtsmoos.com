// B"H
/**
 * MissionRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export const STARTER_MISSIONS = Object.freeze([
  { id:'deliver_bread', chain:'starter', giver:'miriam_baker', title:'Warm Bread, Warm Heart', objectives:[{kind:'deliver',target:'elder_home',count:1}], rewards:{rep:10,shlichusXp:20} },
  { id:'choose_path', chain:'starter', giver:'rebbe_akiva', title:'Choose Your Way', objectives:[{kind:'train',count:1}], rewards:{torahXp:20} },
  { id:'repair_bench', chain:'starter', giver:'betzalel_crafter', title:'Repair the Study Bench', objectives:[{kind:'craft',recipe:'repair_wood',count:1}], rewards:{rep:12} },
  { id:'hidden_courtyard', chain:'starter', giver:'levi_guard', title:'The Hidden Courtyard', objectives:[{kind:'calm',target:'restless_spark',count:1}], rewards:{combatXp:25,rep:15} }
]);
export const getMission=id=>STARTER_MISSIONS.find(m=>m.id===id)||null;
export default { STARTER_MISSIONS, getMission };
