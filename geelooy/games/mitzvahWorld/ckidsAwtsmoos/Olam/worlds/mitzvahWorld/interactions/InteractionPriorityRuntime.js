// B"H
/** @file InteractionPriorityRuntime.js @description Chooses the best interaction candidate without parser-risk syntax. */
const DEFAULT_WEIGHTS = Object.freeze({ explicit:100, npc:90, enemy:82, door:76, collectible:70, world:40, terrain:10, default:20 });

function enabled(item) {
  return item && item.enabled !== false;
}

function distance(item) {
  return Number.isFinite(Number(item.distance)) ? Number(item.distance) : 9999;
}

function typeOf(item) {
  return item && item.type ? item.type : "default";
}

export class InteractionPriorityRuntime {
  constructor(weights = {}) {
    this.weights = Object.assign({}, DEFAULT_WEIGHTS, weights);
  }

  score(candidate) {
    const base = this.weights[typeOf(candidate)] !== undefined ? this.weights[typeOf(candidate)] : this.weights.default;
    const bonus = candidate && candidate.explicit ? 25 : 0;
    return base + bonus - distance(candidate);
  }

  choose(candidates = []) {
    let best = null, bestScore = -Infinity;
    for (const candidate of candidates.filter(enabled)) {
      const score = this.score(candidate);
      if (score > bestScore) { best = candidate; bestScore = score; }
    }
    return best;
  }

  pick(candidates = []) {
    return this.choose(candidates);
  }
}

export default InteractionPriorityRuntime;
