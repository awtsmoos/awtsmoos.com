// B"H
export class LivingPropStateEngine {
  static build(props = [], arc = []) {
    return Object.fromEntries(props.map(prop => [prop.id, this.track(prop, arc)]));
  }
  static track(prop, arc) {
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      wetness: Math.min(1, .35 + index * .1),
      brightness: prop.glow || prop.finalBloom ? Math.min(1, index / 5) : 0,
      windStress: index < 4 ? .8 : .35,
      storyState: this.storyState(prop, beat)
    }));
  }
  static storyState(prop, beat) {
    if (prop.id === beat.object) return 'featuredByStoryArc';
    if (prop.reflection) return 'reflectsEmotionalLight';
    if (prop.gag) return 'comicStateCarrier';
    return 'weatherReactive';
  }
}
