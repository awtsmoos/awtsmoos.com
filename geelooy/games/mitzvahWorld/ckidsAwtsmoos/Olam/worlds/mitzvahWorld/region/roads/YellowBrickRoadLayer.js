// B"H
/** @file YellowBrickRoadLayer.js @description Compact parser-clear metadata for yellow brick road decorations. */
function mainPoints(roads) { const main = roads && roads.main ? roads.main : {}; return Array.isArray(main.points) ? main.points : []; }
export function yellowBrickRoadLayer(roads) { return { segments:mainPoints(roads), width:3.1, collider:"none", edgeFlowers:true, lamps:true }; }
