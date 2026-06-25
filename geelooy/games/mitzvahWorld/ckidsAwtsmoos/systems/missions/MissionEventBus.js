// B"H
/**
 * MissionEventBus
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

const listeners=new Map();
export function onMissionEvent(type,fn){ const list=listeners.get(type)||[]; list.push(fn); listeners.set(type,list); return ()=>listeners.set(type,list.filter(x=>x!==fn)); }
export function emitMissionEvent(type,payload){ (listeners.get(type)||[]).forEach(fn=>fn(payload)); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:mission-event',{detail:{type,payload}})); }
export default { onMissionEvent, emitMissionEvent };
