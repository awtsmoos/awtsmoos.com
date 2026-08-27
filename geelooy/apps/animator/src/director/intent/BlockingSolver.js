// B"H
export class BlockingSolver {
  static build(characters = {}, arc = []) {
    const ids = Object.keys(characters);
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      formation: beat.emotion === 'resolve' ? 'protective_circle' : beat.emotion === 'fear' ? 'wind_scattered_arc' : 'story_triangle',
      anchors: Object.fromEntries(ids.map((id, i) => [id, this.anchorFor(id, i, index, beat.emotion)])),
      reason: beat.reason
    }));
  }
  static anchorFor(id, i, index, emotion) {
    const circle = emotion === 'resolve';
    return { x: circle ? -80 + i * 44 : -180 + i * 92, y: circle ? -6 + (i % 2) * 14 : (index % 2) * 8, focus: id === 'goat_sidekick' ? 'wrong_cord' : 'storm_lantern' };
  }
}
