// B"H
export class SceneStateMachine {
  static build(scene = {}, plan = {}) {
    const arc = plan.storyArc || [];
    return {
      initial: 'storm_arrives',
      final: 'shared_light_survives',
      states: arc.map((beat, index) => ({ at: beat.at ?? index * 2000, state: `${beat.emotion}_${index}`, lanternLit: index >= 4, plazaWetness: Math.min(1, .25 + index * .13), crowdHope: Math.min(1, index * .18) })),
      memory: { sceneId: scene.id, lastLanternState: 'lit', lastWeatherState: 'gold_rain' }
    };
  }
}
