// B"H
/**
 * StarterZoneArcRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export const STARTER_ZONE_ARC = Object.freeze([
  { id:'wake', title:'Wake in the Village', teaches:['camera','movement'], npc:'rebbe_akiva', objective:'Walk to the study courtyard.' },
  { id:'first_chessed', title:'First Act of Chesed', teaches:['interact','inventory'], npc:'miriam_baker', objective:'Deliver warm bread to an elder.' },
  { id:'first_training', title:'Choose a Path', teaches:['trainer','ability'], npc:'rebbe_akiva', objective:'Pick Learner, Helper, Guardian, or Builder.' },
  { id:'first_profession', title:'Hands That Build', teaches:['profession','recipe'], npc:'betzalel_crafter', objective:'Craft or repair one starter object.' },
  { id:'first_danger', title:'Peaceful Courage', teaches:['combat','healing'], npc:'levi_guard', objective:'Enter the hidden courtyard and calm the disturbance.' },
  { id:'home_return', title:'A Place to Return', teaches:['inn','hearth'], npc:'sara_innkeeper', objective:'Bind your home return at the inn.' }
]);
export function getStarterStep(id){ return STARTER_ZONE_ARC.find(s=>s.id===id)||STARTER_ZONE_ARC[0]; }
export function nextStarterStep(id){ const i=STARTER_ZONE_ARC.findIndex(s=>s.id===id); return STARTER_ZONE_ARC[Math.min(STARTER_ZONE_ARC.length-1,i+1)]||STARTER_ZONE_ARC[0]; }
export default { STARTER_ZONE_ARC, getStarterStep, nextStarterStep };
