// B"H
const COLORS = { doubt: '#6f84a8', fear: '#8fb4ff', discovery: '#9ee8ff', resolve: '#ffd978', victory: '#ffe6a1' };
export class EmotionalColorScript {
  static build(arc = []) {
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      keyColor: COLORS[beat.emotion] || COLORS.resolve,
      saturation: Math.min(1, .42 + index * .09),
      contrast: beat.emotion === 'fear' ? .88 : .62,
      fog: Math.max(.12, .58 - index * .07),
      rainVisibility: beat.emotion === 'victory' ? 'gold_streaks' : 'silver_streaks'
    }));
  }
}
