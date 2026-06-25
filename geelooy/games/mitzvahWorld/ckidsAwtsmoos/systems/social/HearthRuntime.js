// B"H
/** Hearth runtime: the player gets a true home return in the village. */
const KEY='mitzvahWorld.hearth';
let memory={ id:'village_inn', x:4, y:0, z:-6 };
function storage(){ try{return globalThis.localStorage||null;}catch{return null;} }
export function bindHearth(place={ id:'village_inn', x:4, y:0, z:-6 }){ const data={...place,boundAt:Date.now()}; memory=data; try{storage()?.setItem?.(KEY,JSON.stringify(data));}catch{} globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:hearth-bound',{detail:data})); return data; }
export function getHearth(){ try{return JSON.parse(storage()?.getItem?.(KEY)||'null')||memory;}catch{return memory;} }
export function recallHearth(){ const dest=getHearth(); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:travel-request',{detail:{kind:'hearth',dest}})); return dest; }
export default { bindHearth, getHearth, recallHearth };
