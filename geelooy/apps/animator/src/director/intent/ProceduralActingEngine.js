// B"H
export class ProceduralActingEngine {
  static build(characters = {}, motivation = {}, gestures = {}) {
    return Object.fromEntries(Object.keys(characters).map(id => [id, this.track(motivation[id] || [], gestures[id] || [])]));
  }
  static track(motivation, gestures) {
    return motivation.map((motive, index) => ({
      at: motive.at,
      idle: motive.pressure > .8 ? 'tense_micro_shift' : 'rain_weighted_breath',
      interruption: motive.primary.includes('storm') ? 'thunder_glance' : 'wind_check',
      recovery: motive.pressure > .8 ? 'small_brave_reset' : 'soften_back_to_goal',
      gesture: gestures[index % Math.max(1, gestures.length)]?.gesture || 'hold_intent'
    }));
  }
}
