// B"H
const PALETTES = {
  doubt: ['#6f84a8', '#1b2742', .34], fear: ['#8fb4ff', '#16233f', .28],
  discovery: ['#9ee8ff', '#203a56', .46], resolve: ['#ffd978', '#263553', .72],
  victory: ['#ffe6a1', '#344a68', 1]
};

export class EmotionalLightingEngine {
  static build(arc = []) {
    return arc.map((beat, index) => this.beat(beat, index));
  }
  static beat(beat, index) {
    const mood = beat.emotion || beat.id || 'resolve';
    const [key, shadow, bloom] = PALETTES[mood] || PALETTES.resolve;
    return { at: beat.at ?? index * 2000, mood, key, shadow, bloom, eyeCatch: Math.min(1, bloom + .18), rim: key, reason: beat.reason || `light follows ${mood}` };
  }
}
