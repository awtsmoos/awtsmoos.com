// B"H
/** Travel runtime: unlock-aware wagon routes and hearth-compatible events. */
import { getTravelRoute, TRAVEL_ROUTES } from './TravelRouteRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function createTravelRuntime(done=[]){ const completed=new Set(done); return { routes(){return TRAVEL_ROUTES.filter(r=>!r.unlock||completed.has(r.unlock));}, unlock(id){completed.add(id);return this.routes();}, travel(id){const route=getTravelRoute(id); if(!route)return{ok:false,error:'missing'}; if(route.unlock&&!completed.has(route.unlock))return{ok:false,error:'locked',route}; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:travel-request',{detail:{kind:'route',route}})); return{ok:true,route};} }; }
export default createTravelRuntime;
