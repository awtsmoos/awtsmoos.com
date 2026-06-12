// B"H
/** @file RegionBuildReport.js @description Summarizes the full region plan. */
export function buildRegionReport(data){return {ok:true,kind:'mitzvah-region-stack',createdAt:Date.now(),...data,summary:{biomes:data.biomes?.length||0,roads:Object.keys(data.roads||{}).length,houses:data.houses?.length||0,animalTerritories:data.wildlife?.territories?.length||0,hardColliders:data.colliders?.hard?.length||0}};}
