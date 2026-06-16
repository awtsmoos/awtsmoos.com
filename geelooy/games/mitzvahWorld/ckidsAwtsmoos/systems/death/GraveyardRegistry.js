// B"H
/** @file GraveyardRegistry.js @description Known solo-safe resurrection anchors. */
export const GraveyardRegistry = Object.freeze([{ id:"village_graveyard", name:"Village Graveyard", x:18, y:0, z:-22 }, { id:"forest_shrine", name:"Forest Shrine", x:104, y:0, z:-88 }]);
export function graveyardById(id) { return GraveyardRegistry.find(g => g.id === id) || GraveyardRegistry[0]; }
export default GraveyardRegistry;
