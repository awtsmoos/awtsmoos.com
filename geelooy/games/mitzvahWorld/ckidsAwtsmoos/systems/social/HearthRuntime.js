// B"H
/** Hearth runtime: the player gets a true home return in the village and the starter arc hears it. */
const KEY='mitzvahWorld.hearth';
let memory={ id:'village_inn', x:4, y:0, z:-6 };
function storage(){ try{return globalThis.localStorage||null;}catch{return null;} }
function event(type,detail){ globalThis.dispatchEvent?.(new CustomEvent(type,{detail})); return detail; }
export function bindHearth(place={ id:'village_inn', x:4, y:0, z:-6 }){ const data={...place,boundAt:Date.now()}; memory=data; try{storage()?.setItem?.(KEY,JSON.stringify(data));}catch{} event('mitzvah-world:hearth-bound',data); event('mitzvah-world:starter-signal',{ signal:'hearth', evidence:data }); return data; }
export function getHearth(){ try{return JSON.parse(storage()?.getItem?.(KEY)||'null')||memory;}catch{return memory;} }
export function recallHearth(){ const dest=getHearth(); event('mitzvah-world:travel-request',{kind:'hearth',dest}); return dest; }
export default { bindHearth, getHearth, recallHearth };
