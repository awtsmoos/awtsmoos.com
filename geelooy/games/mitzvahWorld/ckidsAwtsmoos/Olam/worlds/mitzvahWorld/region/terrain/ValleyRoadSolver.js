// B"H
/** @file ValleyRoadSolver.js @description Turns valleys into road candidates. */
export function solveValleyRoads(terrain){return (terrain.valleys||[]).map(([x1,z1,x2,z2],i)=>({id:`valley-road-${i}`,points:[[x1,z1],[(x1+x2)/2,(z1+z2)/2],[x2,z2]],kind:i?'forest-trail':'main-road'}));}
