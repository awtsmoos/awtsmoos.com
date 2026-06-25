// B"H
/**
 * VillageDailyLifeRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

const SLOTS=[['dawn','daven'],['morning','work'],['noon','market'],['afternoon','learn'],['evening','family'],['night','sleep']];
export function dailyRole(hour=new Date().getHours()){ return SLOTS[Math.floor((hour%24)/4)]?.[1]||'work'; }
export function createVillageDailyLifeRuntime(npcs=[]){ return { snapshot(hour){const role=dailyRole(hour);return npcs.map(n=>({id:n.id||n.npcId,role,place:n.home||'village_square'}));}, apply(hour){const snap=this.snapshot(hour); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:village-life',{detail:{hour, snap}})); return snap;} }; }
export default createVillageDailyLifeRuntime;
