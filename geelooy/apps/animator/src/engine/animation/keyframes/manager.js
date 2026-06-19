// B”H
// Keyframe Manager - Time is but a series of points in the Awtsmoos.

export class KeyframeManager {
  constructor() {
    this.sequences = new Map();
  }

  addKeyframe(partId, time, properties) {
    if (!this.sequences.has(partId)) {
      this.sequences.set(partId, []);
    }
    const sequence = this.sequences.get(partId);
    sequence.push({ time, properties });
    sequence.sort((a, b) => a.time - b.time);
  }

  interpolate(partId, currentTime) {
    const sequence = this.sequences.get(partId);
    if (!sequence || sequence.length === 0) return null;

    if (currentTime <= sequence[0].time) return sequence[0].properties;
    if (currentTime >= sequence[sequence.length - 1].time) return sequence[sequence.length - 1].properties;

    for (let i = 0; i < sequence.length - 1; i++) {
      const start = sequence[i];
      const end = sequence[i + 1];
      if (currentTime >= start.time && currentTime <= end.time) {
        const t = (currentTime - start.time) / (end.time - start.time);
        return this.lerpProperties(start.properties, end.properties, t);
      }
    }
    return null;
  }

  lerpProperties(p1, p2, t) {
    const result = {};
    for (const key in p1) {
      if (typeof p1[key] === 'number' && typeof p2[key] === 'number') {
        result[key] = p1[key] + (p2[key] - p1[key]) * t;
      } else {
        result[key] = t < 0.5 ? p1[key] : p2[key];
      }
    }
    return result;
  }
}
