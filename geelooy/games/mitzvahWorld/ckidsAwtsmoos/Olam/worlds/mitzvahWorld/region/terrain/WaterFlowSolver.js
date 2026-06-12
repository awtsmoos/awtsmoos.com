// B"H
/** @file WaterFlowSolver.js @description Lightweight water flow plan for river/marsh placement. */
export function solveWaterFlow(terrain){return {streams:[[-180,80,-60,20,120,-10,210,-60]],marshes:(terrain.basins||[]).map(([x,z,r,w],i)=>({id:`marsh-${i}`,x,z,r,wetness:w}))};}
