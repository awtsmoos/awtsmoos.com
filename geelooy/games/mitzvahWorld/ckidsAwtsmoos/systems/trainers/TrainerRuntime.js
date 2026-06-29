// B"H
/**
 * TrainerRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { trainerForPath } from './TrainerRegistry.js';
export function createTrainerRuntime(store={}){ const learned=store.learnedAbilities||=[]; return { train(path='learner'){ const trainer=trainerForPath(path); if(!learned.includes(trainer.ability)) learned.push(trainer.ability); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:trained',{detail:{trainer,learned}})); return trainer; }, known(){return learned.slice();} }; }
export function rankedPassage(olam={},passage={}){ const p=olam.player||olam.chossid||{}, ranks=p.passageRanks||olam.__passageRanks||{}; const id=passage.id||passage.name||"passage"; const rank=Math.max(1, Number(ranks[id]||passage.rank||1)); return { ...passage, rank, cost:Math.max(0, Math.round(Number(passage.cost||passage.koachCost||0) * (1 + (rank - 1) * .18))), damage:Math.round(Number(passage.damage||12) * (1 + (rank - 1) * .28)) }; }
export function trainerPayload(){ const paths=["learner","guardian","builder","healer"]; return { trainers:paths.map(path=>({ path, ...trainerForPath(path), state:"trainable" })) }; }
export default createTrainerRuntime;
