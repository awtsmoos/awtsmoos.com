// B"H
/**
 * ProfessionRegistry
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import STARTER_PROFESSIONS from './StarterProfessionRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export const PROFESSIONS=STARTER_PROFESSIONS;
export const getProfession=id=>PROFESSIONS.find(p=>p.id===id)||null;
export default { PROFESSIONS, getProfession };
