// B"H
export class SceneContinuityMemory {
  static build(scene = {}, plan = {}) {
    return {
      carriesForward: {
        lanternLit: true,
        stormStillPresent: true,
        plazaWetness: plan.environmentalMemory?.at(-1)?.puddleSpread || 1,
        childHasSharedLight: true
      },
      nextSceneHooks: ['drying_flags', 'shared_lantern_walk', 'goat_bell_echo', 'captain_humbled_schedule'],
      previousSceneAssumptions: ['lantern_unproven', 'plaza_waiting', 'storm_arriving'],
      sceneId: scene.id
    };
  }
}
