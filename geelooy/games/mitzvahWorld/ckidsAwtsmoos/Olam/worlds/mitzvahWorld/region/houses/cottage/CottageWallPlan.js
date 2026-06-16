// B"H
/** @file CottageWallPlan.js @description Wall segment/opening plan for cottage brick builder. */
export function wallOpeningsFor(house = {}, spec = {}) { const door = { side:"front", x:0, y:(spec.doorHeight || 2.15)/2, width:spec.doorWidth || 1.28, height:spec.doorHeight || 2.15, kind:"door" }; const windows = (house.windows || []).map((w,i) => ({ side:w.side || "front", x:w.x || 0, z:w.z || 0, y:w.y || 1.75, width:.7, height:.52, kind:"window", id:`window_${i}` })); return [door, ...windows]; }
export function makeWallPlan(house = {}, spec = {}) { const width = spec.width || house.sx || 6.2, depth = spec.depth || house.sz || 5.4, height = spec.height || house.sy || 3.2; return { width, depth, height, openings:wallOpeningsFor(house, spec), walls:["front","back","left","right"].map(side => ({ side, width:side === "front" || side === "back" ? width : depth, height })) }; }
export default makeWallPlan;
