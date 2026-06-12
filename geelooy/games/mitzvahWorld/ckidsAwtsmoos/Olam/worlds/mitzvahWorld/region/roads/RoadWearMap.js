// B"H
/** @file RoadWearMap.js @description Road traffic and mud masks. */
export function roadWearAt(distanceToRoad,traffic=.5){return Math.max(0,1-distanceToRoad/8)*traffic;}
