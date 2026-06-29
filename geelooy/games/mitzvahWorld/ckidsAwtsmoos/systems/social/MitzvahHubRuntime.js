// B"H
/** MitzvahHubRuntime: visits, service discovery, and hub onboarding quest. */
import { VILLAGE_SERVICES, getVillageService } from './VillageServiceRegistry.js';
export function createMitzvahHubRuntime(store={}){ store.hubVisits ||= []; return { services(){return VILLAGE_SERVICES;}, visit(id){ const service=getVillageService(id); if(!service)return{ok:false,error:'missing'}; if(!store.hubVisits.includes(id))store.hubVisits.push(id); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:hub-visit',{detail:{service,count:store.hubVisits.length}})); return{ok:true,service,count:store.hubVisits.length};}, hubQuest(){return{id:'know_the_village',title:'Know the Village',objective:'Visit inn, trainer, vendor, travel wagon, and tzedakah box.',progress:store.hubVisits.length,total:5,visited:store.hubVisits.slice()};} }; }
export default createMitzvahHubRuntime;
