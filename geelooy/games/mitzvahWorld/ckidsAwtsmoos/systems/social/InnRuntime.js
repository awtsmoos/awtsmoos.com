// B"H
/** Inn runtime: rest, rumors, hearth binding, and a social hub. */
import { bindHearth } from './HearthRuntime.js';
export function restAtInn(player={}, place={id:'village_inn'}){ const rested={ restedXpBonus:true, restedAt:Date.now(), durationMs:30*60*1000, place }; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:rested',{detail:{player,rested}})); return rested; }
export function createInnRuntime(store={}){ return { rest(player={}){return restAtInn(player);}, bindHome(place){return bindHearth(place||{id:'village_inn',x:4,y:0,z:-6});}, rumors(){return (store.rumors||[]).slice(-3);}, menu(){return ['Rest here','Bind home return','Hear village rumors'];} }; }
export default createInnRuntime;
