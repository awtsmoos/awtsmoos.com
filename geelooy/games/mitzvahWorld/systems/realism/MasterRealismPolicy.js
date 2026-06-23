// B"H
/**
 * @file MasterRealismPolicy.js
 * Master realism covenant: ancient Jewish world detail is revealed by distance,
 * visibility, and frame budget, not by wasteful every-frame imagination.
 */
export function masterRealismPolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const tier = budget?.tier || "high";
  const density = budget?.density || {};
  const simulation = budget?.simulation || {};
  return {
    tier,
    target: "living ancient Jewish world at stable 60 FPS",
    law: "near-real, far-statistical, shared-materials, pooled-geometry, event-driven-simulation",
    textures: {
      mipmaps: true,
      anisotropy: tier === "survival" ? 2 : tier === "balanced" ? 4 : 8,
      wrapping: "RepeatWrapping",
      atlasRequired: true,
      shareMaterials: true
    },
    animals: {
      density: density.animals ?? 1,
      geometry: "single-body-mesh-with-shared-cache",
      material: "single-atlas-material-per-species-family",
      nearHz: simulation.nearHz || 30,
      midHz: simulation.midHz || 4,
      farHz: simulation.farHz || 1,
      horizon: "statistical-ecosystem"
    },
    npcs: {
      density: density.npcs ?? 1,
      nearHz: simulation.nearHz || 30,
      midHz: simulation.midHz || 4,
      farHz: simulation.farHz || 1,
      horizon: "schedule-statistics",
      memory: "event-driven-durable-facts"
    },
    terrain: {
      erosionMaps: true,
      runoffMaps: true,
      slopeTextureBlending: true,
      footpathsAsPersistentMasks: true,
      meshMutation: "chunk-budgeted-only"
    },
    villages: {
      mergedHouses: true,
      instancedProps: true,
      wearMasks: true,
      density: density.villageProps ?? 1
    },
    missions: {
      eventDriven: true,
      maxActiveNear: density.missions ?? 7,
      noPerFrameQuestScanning: true
    },
    ui: {
      aesthetic: "parchment-scroll-seforim-candle-brass-wood-gold-leaf",
      maxOpenPanels: tier === "survival" ? 1 : 3,
      collapsible: true,
      lowLayoutCost: true
    }
  };
}
export default masterRealismPolicy;
