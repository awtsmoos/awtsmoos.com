// B"H
/**
 * HearthRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

const KEY='mitzvahWorld.hearth';
export function bindHearth(place={ id:'village_inn', x:0, y:0, z:0 }){ const data={...place,boundAt:Date.now()}; globalThis.localStorage?.setItem?.(KEY,JSON.stringify(data)); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:hearth-bound',{detail:data})); return data; }
export function getHearth(){ try{return JSON.parse(globalThis.localStorage?.getItem?.(KEY)||'null')||{id:'village_inn',x:0,y:0,z:0};}catch{return {id:'village_inn',x:0,y:0,z:0};} }
export function recallHearth(){ const dest=getHearth(); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:travel-request',{detail:{kind:'hearth',dest}})); return dest; }
export default { bindHearth, getHearth, recallHearth };
