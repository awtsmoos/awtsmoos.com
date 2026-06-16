// B"H
/** @file TravelRouteRegistry.js @description Discovered solo travel routes. */
export const TravelRouteRegistry = Object.freeze([{ id:"village_to_forest", from:"village", to:"forestEdge", cost:1 }, { id:"forest_to_cave", from:"forestEdge", to:"hiddenCave", cost:3 }]);
export function routeById(id) { return TravelRouteRegistry.find(r => r.id === id) || null; }
export default TravelRouteRegistry;
