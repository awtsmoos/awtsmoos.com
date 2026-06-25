// B"H
/**
 * ProfessionRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { craft } from './RecipeRuntime.js';
export function createProfessionRuntime(store={}){ const skill=store.professions||={}; return { craft(recipe,bag){ const out=craft(recipe,bag); if(out.ok)skill[recipe]=(skill[recipe]||0)+1; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:crafted',{detail:{recipe,out,skill}})); return out; }, skill(){return {...skill};} }; }
export default createProfessionRuntime;
