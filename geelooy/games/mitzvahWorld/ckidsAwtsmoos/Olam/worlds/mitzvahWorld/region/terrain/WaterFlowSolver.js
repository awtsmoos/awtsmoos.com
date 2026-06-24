// B"H
/** @file WaterFlowSolver.js @description Rivers, marshes, erosion scars, and animal drinking routes. */
export function solveWaterFlow(terrain={}){ const basins=terrain.basins||[]; const streams=[[-180,80,-60,20,120,-10,210,-60],[-95,120,-40,55,12,20,96,12]]; return { streams, marshes:basins.map(([x,z,r,w],i)=>({id:`marsh-${i}`,x,z,r,wetness:w})), drinkPoints:streams.flatMap((s,i)=>[{id:`drink-${i}-a`,x:s[0],z:s[1]},{id:`drink-${i}-b`,x:s[4],z:s[5]}]), erosionScars:streams.map((s,i)=>({id:`erosion-${i}`,points:s,sediment:.35})) }; }
export default solveWaterFlow;
