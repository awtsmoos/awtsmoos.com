// B"H

/**
 * @file EpisodeDurationEngine.js
 * @description
 * The duration covenant: a generated episode must not be a demo. It must carry
 * at least twenty created minutes, arranged in acts, sequences, shots, and beats.
 */
export class EpisodeDurationEngine {
  static MIN_MS = 20 * 60 * 1000;
  static BLOCK_MS = 30 * 1000;

  static expand(premise) {
    const blocks = Math.ceil(this.MIN_MS / this.BLOCK_MS);
    const actNames = ['Cold Open', 'Act One', 'Act Two', 'Act Three', 'Tag'];
    const shots = [];
    let time = 0;
    for (let i = 0; i < blocks; i++) {
      const act = actNames[Math.min(actNames.length - 1, Math.floor(i / 8))];
      const sequence = this.sequenceName(i, premise);
      const duration = this.BLOCK_MS;
      shots.push(this.block(i, act, sequence, time, duration, premise));
      time += duration;
    }
    return { duration: time, acts: this.acts(shots), shots };
  }

  static block(i, act, sequence, start, duration, premise) {
    const trackCycle = ['Camera', 'Dialogue', 'Action', 'Effects'];
    return {
      id: `episode_block_${String(i + 1).padStart(2, '0')}`,
      act,
      sequence,
      track: trackCycle[i % trackCycle.length],
      start,
      duration,
      name: `${act}: ${sequence}`,
      description: this.description(i, premise),
      furDetail: i % 5 === 0 ? 'Add secondary fur/cloth jitter and silhouette polish.' : 'Maintain clean cartoon shape language.'
    };
  }

  static sequenceName(i) {
    const names = ['setup', 'reaction', 'argument', 'cutaway', 'choice', 'mistake', 'chase', 'button'];
    return `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`;
  }

  static description(i, premise) {
    const beats = ['establishes', 'twists', 'escalates', 'interrupts', 'pays off'];
    return `Beat ${i + 1} ${beats[i % beats.length]} the premise: ${premise}`;
  }

  static acts(shots) {
    return Object.values(shots.reduce((map, shot) => {
      const row = map[shot.act] || { name: shot.act, start: shot.start, duration: 0, shots: 0 };
      row.duration += shot.duration; row.shots += 1; map[shot.act] = row; return map;
    }, {}));
  }
}
