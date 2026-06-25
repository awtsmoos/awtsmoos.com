// B"H
/**
 * TrainerRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { STARTER_CLASS_PATHS } from '../tutorial/StarterClassPathRegistry.js';
export const TRAINERS = Object.freeze(STARTER_CLASS_PATHS.map(path=>({ id:path.trainer, path:path.id, title:path.title+' Trainer', ability:path.ability, lesson:path.fantasy })));
export const getTrainer=id=>TRAINERS.find(t=>t.id===id)||null;
export const trainerForPath=path=>TRAINERS.find(t=>t.path===path)||TRAINERS[0];
export default { TRAINERS, getTrainer, trainerForPath };
