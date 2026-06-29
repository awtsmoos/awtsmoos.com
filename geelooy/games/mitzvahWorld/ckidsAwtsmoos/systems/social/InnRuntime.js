// B"H
/**
 * InnRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { bindHearth } from './HearthRuntime.js';
export function createInnRuntime(){ return {
  rest(player={}){ const rested={ restedXpBonus:true, restedAt:Date.now(), durationMs:30*60*1000 }; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:rested',{detail:{player,rested}})); return rested; },
  bindHome(place){ return bindHearth(place||{id:'village_inn',x:4,y:0,z:-6}); },
	  menu(){ return ['Rest here','Bind home return','Hear village rumors']; }
	}; }
export function restAtInn(olam={}){ const rested=createInnRuntime().rest(olam.player||{}); olam.rested=rested; olam.ayshPeula?.("ui event","innRest",{ rested }); return { rested }; }
export default createInnRuntime;
