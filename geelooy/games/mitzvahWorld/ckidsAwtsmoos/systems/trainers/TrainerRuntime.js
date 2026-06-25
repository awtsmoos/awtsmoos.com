// B"H
/**
 * TrainerRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { trainerForPath } from './TrainerRegistry.js';
export function createTrainerRuntime(store={}){ const learned=store.learnedAbilities||=[]; return { train(path='learner'){ const trainer=trainerForPath(path); if(!learned.includes(trainer.ability)) learned.push(trainer.ability); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:trained',{detail:{trainer,learned}})); return trainer; }, known(){return learned.slice();} }; }
export default createTrainerRuntime;
