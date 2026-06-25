// B"H
/**
 * TravelRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { getTravelRoute, TRAVEL_ROUTES } from './TravelRouteRegistry.js';
export function createTravelRuntime(done=[]){ const completed=new Set(done); return { routes(){return TRAVEL_ROUTES.filter(r=>!r.unlock||completed.has(r.unlock));}, travel(id){const route=getTravelRoute(id); if(!route)return{ok:false,error:'missing'}; if(route.unlock&&!completed.has(route.unlock))return{ok:false,error:'locked'}; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:travel-request',{detail:{kind:'route',route}})); return{ok:true,route};} }; }
export default createTravelRuntime;
