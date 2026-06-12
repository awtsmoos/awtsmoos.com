// B"H
/** @file YellowBrickRoadLayer.js @description Yellow brick road build spec. */
export function yellowBrickRoadLayer(roads){return {segments:roads.main?.points||[],width:3.1,collider:'none',edgeFlowers:true,lamps:true};}
