// B"H
/** Inn runtime: rest, rumors, hearth binding, and a social hub. */
import { bindHearth } from './HearthRuntime.js';
<<<<<<< HEAD
export function createInnRuntime(){ return {
  rest(player={}){ const rested={ restedXpBonus:true, restedAt:Date.now(), durationMs:30*60*1000 }; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:rested',{detail:{player,rested}})); return rested; },
  bindHome(place){ return bindHearth(place||{id:'village_inn',x:4,y:0,z:-6}); },
	  menu(){ return ['Rest here','Bind home return','Hear village rumors']; }
	}; }
export function restAtInn(olam={}){ const rested=createInnRuntime().rest(olam.player||{}); olam.rested=rested; olam.ayshPeula?.("ui event","innRest",{ rested }); return { rested }; }
=======
export function restAtInn(player={}, place={id:'village_inn'}){ const rested={ restedXpBonus:true, restedAt:Date.now(), durationMs:30*60*1000, place }; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:rested',{detail:{player,rested}})); return rested; }
export function createInnRuntime(store={}){ return { rest(player={}){return restAtInn(player);}, bindHome(place){return bindHearth(place||{id:'village_inn',x:4,y:0,z:-6});}, rumors(){return (store.rumors||[]).slice(-3);}, menu(){return ['Rest here','Bind home return','Hear village rumors'];} }; }
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
export default createInnRuntime;
