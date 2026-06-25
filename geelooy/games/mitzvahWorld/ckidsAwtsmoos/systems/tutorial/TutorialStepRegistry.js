// B"H
/**
 * TutorialStepRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { STARTER_ZONE_ARC } from './StarterZoneArcRegistry.js';
export const TUTORIAL_STEPS = Object.freeze(STARTER_ZONE_ARC.map((step,index)=>({ ...step, index, hint:
  index===0?'Use movement to reach the glowing courtyard.':
  index===1?'Talk, accept, deliver, return.':
  index===2?'A trainer gives identity and one safe ability.':
  index===3?'Professions start with one useful recipe.':
  index===4?'Combat teaches care, not chaos.':'Bind home so the village becomes yours.' })));
export function getTutorialStep(id){ return TUTORIAL_STEPS.find(s=>s.id===id)||TUTORIAL_STEPS[0]; }
export function tutorialProgress(done=[]){ const set=new Set(done); return { done:set.size,total:TUTORIAL_STEPS.length,next:TUTORIAL_STEPS.find(s=>!set.has(s.id))||null }; }
export default { TUTORIAL_STEPS, getTutorialStep, tutorialProgress };
