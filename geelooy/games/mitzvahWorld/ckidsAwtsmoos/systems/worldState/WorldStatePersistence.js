// B"H
/**
 * WorldStatePersistence
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { loadWorldState, saveWorldState, mutateWorldState } from './WorldStateStore.js';
export function rememberDelta(key,value){ return mutateWorldState(s=>{s[key]=value; s.updatedAt=Date.now(); return s;}); }
export { loadWorldState, saveWorldState, mutateWorldState };
export default { rememberDelta, loadWorldState, saveWorldState, mutateWorldState };
