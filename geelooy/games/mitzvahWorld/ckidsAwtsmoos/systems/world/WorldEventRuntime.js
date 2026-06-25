// B"H
/**
 * WorldEventRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import EVENTS from './StartingZoneEventRegistry.js';
export function createWorldEventRuntime(){ return { due(slot){return EVENTS.filter(e=>e.at===slot);}, announce(slot){const due=this.due(slot); due.forEach(e=>globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:world-event',{detail:e}))); return due;} }; }
export default createWorldEventRuntime;
