// B"H
/**
 * StarterClassPathRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export const STARTER_CLASS_PATHS = Object.freeze([
  { id:'learner', title:'Learner', trainer:'rebbe_akiva', ability:'focus_breath', reward:{ torahXp:20 }, fantasy:'You reveal light by learning before acting.' },
  { id:'helper', title:'Helper', trainer:'miriam_baker', ability:'chesed_hands', reward:{ shlichusXp:20 }, fantasy:'You carry kindness from house to house.' },
  { id:'guardian', title:'Guardian', trainer:'levi_guard', ability:'shield_of_peace', reward:{ combatXp:20 }, fantasy:'You protect the weak without loving battle.' },
  { id:'builder', title:'Builder', trainer:'betzalel_crafter', ability:'repair_spark', reward:{ explorationXp:20 }, fantasy:'You repair broken vessels into useful homes.' }
]);
export function getStarterClassPath(id='learner'){ return STARTER_CLASS_PATHS.find(p=>p.id===id)||STARTER_CLASS_PATHS[0]; }
export function listStarterClassPaths(){ return STARTER_CLASS_PATHS.map(p=>({...p})); }
export default { STARTER_CLASS_PATHS, getStarterClassPath, listStarterClassPaths };
