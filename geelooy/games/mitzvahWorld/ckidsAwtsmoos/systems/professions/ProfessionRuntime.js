// B"H
/**
 * ProfessionRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { craft } from './RecipeRuntime.js';
export function createProfessionRuntime(store={}){ const skill=store.professions||={}; return { craft(recipe,bag){ const out=craft(recipe,bag); if(out.ok)skill[recipe]=(skill[recipe]||0)+1; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:crafted',{detail:{recipe,out,skill}})); return out; }, skill(){return {...skill};} }; }
export function grantProfessionXp(olam={},profession="general",amount=1){ const p=olam.player||olam.chossid||olam; p.professions ||= {}; const row=p.professions[profession] ||= { xp:0, level:1 }; row.xp += Number(amount)||0; row.level = Math.max(1, Math.floor(row.xp / 100) + 1); olam.ayshPeula?.("ui event","professionXp",{ profession, amount, xp:row.xp, level:row.level }); return { profession, ...row }; }
export default createProfessionRuntime;
