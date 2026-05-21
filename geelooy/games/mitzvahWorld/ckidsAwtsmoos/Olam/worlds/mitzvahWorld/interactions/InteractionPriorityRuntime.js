/**
 * B"H
 * Chapter 27: Many Hands Reached, One Spark Answered.
 */

export class InteractionPriorityRuntime {
  constructor(weights = {}) {
    this.weights = { door: 90, npc: 80, collectible: 70, default: 10, ...weights };
  }

  pick(candidates = []) {
    return [...candidates]
      .filter(item => item?.enabled !== false)
      .sort((a, b) => this.score(b) - this.score(a))[0] || null;
  }

  score(candidate) {
    const base = this.weights[candidate.type] ?? this.weights.default;
    const distancePenalty = Number(candidate.distance || 0);
    return base - distancePenalty;
  }
}

export default InteractionPriorityRuntime;
