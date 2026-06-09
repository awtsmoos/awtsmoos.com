// B"H
/**
 * @file performanceManifest.js
 * @description Chapter 498: The renderer receives concrete vows: instancing,
 * culling, density profiles, and mobile headroom targets.
 */
export const PERFORMANCE_MANIFEST = Object.freeze({
  profiles: Object.freeze(['ultraLow', 'mobile', 'balanced', 'desktop', 'epic']),
  instancingGroups: Object.freeze(['road_edge_stone', 'plaza_cobble', 'entry_path_center_cobble', 'etz_firefly', 'district_accent_banner', 'market_produce', 'laundry', 'flower_patch']),
  cullRadii: Object.freeze({ tinyProps: 180, marketProps: 220, vistaProps: 900, houseMicroProps: 260, fireflies: 90 }),
  ultraLowRules: Object.freeze({ disableLaundry: true, reduceCrowds: true, reduceAccents: true, reduceRoadEdges: true, reduceFlowers: true }),
  mobileTargets: Object.freeze({ maxDomem: 1350, maxTrees: 200, targetDomemHeadroom: 110, targetCompileMs: 2500 })
});
