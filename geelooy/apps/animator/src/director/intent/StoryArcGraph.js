// B"H
export class StoryArcGraph {
  static outdoorStormLantern() {
    return [
      { at: 0, emotion: 'doubt', reason: 'tiny light under huge sky', object: 'storm_lantern', look: 'storm_lantern', note: 'Make the plaza feel too large.' },
      { at: 2200, emotion: 'fear', reason: 'lightning reveals the threat', object: 'stormClouds', look: 'kite_cartographer' },
      { at: 5200, emotion: 'discovery', reason: 'blue spark answers rain', object: 'blue_storm_core', look: 'puddleGlow' },
      { at: 9200, emotion: 'fear', reason: 'wind almost steals the answer', object: 'storm_lantern', look: 'quiet_lamp_child' },
      { at: 12800, emotion: 'resolve', reason: 'ensemble shelters the flame', object: 'ensembleCircle', look: 'storm_lantern_maker' },
      { at: 16600, emotion: 'victory', reason: 'rain becomes visible light', object: 'lantern_gold_bloom', look: 'ensemble' }
    ];
  }
}
