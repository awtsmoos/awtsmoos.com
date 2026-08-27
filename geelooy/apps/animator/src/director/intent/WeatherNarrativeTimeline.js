// B"H
export class WeatherNarrativeTimeline {
  static build(arc = []) {
    const states = ['gatheringWind', 'hardRain', 'lightningSplit', 'heldBreathMist', 'goldRain', 'softAfterglow'];
    return states.map((state, i) => ({
      at: arc[i]?.at ?? i * 3200, state,
      rain: Math.max(.18, .82 - i * .08), wind: i < 3 ? .7 + i * .06 : .42,
      light: i >= 4 ? 'warmLanternWeather' : 'coldStormWeather', storyReason: arc[i]?.reason || state
    }));
  }
}
