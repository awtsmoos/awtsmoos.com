// B"H
/**
 * ReputationRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { reputationDelta } from './VillageReputationRules.js';
export function createReputationRuntime(store={}){ const rep=store.reputation||={village:0}; return { add(kind,faction='village'){rep[faction]=(rep[faction]||0)+reputationDelta(kind); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:reputation',{detail:{faction,value:rep[faction],kind}})); return rep[faction];}, get(faction='village'){return rep[faction]||0;} }; }
export default createReputationRuntime;
