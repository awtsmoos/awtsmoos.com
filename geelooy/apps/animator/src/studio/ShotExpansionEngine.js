// B"H

/**
 * @file ShotExpansionEngine.js
 * @description
 * Splits each thirty-second block into smaller edit beats for reactions,
 * inserts, cutaways, and breath. Forty blocks become a real editable sequence.
 */
export class ShotExpansionEngine {
  static expand(shots) {
    return shots.flatMap((shot) => this.beats(shot));
  }

  static beats(shot) {
    const parts = [['wide', 0, 6000], ['medium', 6000, 7000], ['reaction', 13000, 5000], ['insert', 18000, 4000], ['button', 22000, 8000]];
    return parts.map(([kind, offset, duration], index) => ({
      id: `${shot.id}_${kind}`,
      shotId: shot.id,
      kind,
      start: shot.start + offset,
      duration,
      track: shot.track,
      name: `${shot.name} / ${kind}`,
      camera: index % 2 === 0 ? 'stable comedy frame' : 'snap reframed gag'
    }));
  }
}
