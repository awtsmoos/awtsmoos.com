// B"H
/**
 * ProfessionRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import STARTER_PROFESSIONS from './StarterProfessionRegistry.js';
export const PROFESSIONS=STARTER_PROFESSIONS;
export const getProfession=id=>PROFESSIONS.find(p=>p.id===id)||null;
export default { PROFESSIONS, getProfession };
