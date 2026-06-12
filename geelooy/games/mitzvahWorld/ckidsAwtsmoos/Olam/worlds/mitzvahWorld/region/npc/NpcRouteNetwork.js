// B"H
/** @file NpcRouteNetwork.js @description NPC route graph. */
export function npcRouteNetwork(roads={}){return {routes:[roads.main?.points||[],roads.farm?.points||[]],stops:['market','well','farm','orchard','home']};}
