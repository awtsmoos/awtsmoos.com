// B"H
/**
 * MitzvahHubRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { VILLAGE_SERVICES } from './VillageServiceRegistry.js';
export function createMitzvahHubRuntime(){ const state={visited:new Set(),announced:false}; return {
  services(){ return VILLAGE_SERVICES; },
  visit(id){ state.visited.add(id); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:hub-visit',{detail:{id,count:state.visited.size}})); return state.visited.size; },
  hubQuest(){ return { id:'know_the_village', title:'Know the Village', objective:'Visit inn, trainer, vendor, travel wagon, and tzedakah box.', progress:state.visited.size, total:5 }; }
}; }
export default createMitzvahHubRuntime;
