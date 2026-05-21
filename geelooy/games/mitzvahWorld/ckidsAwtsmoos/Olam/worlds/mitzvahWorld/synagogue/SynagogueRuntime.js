/**
 * B"H
 * Chapter 37: The Hall Counted Voices Into One Flame.
 */

export class SynagogueRuntime {
  constructor({ minyanSize = 10 } = {}) {
    this.minyanSize = minyanSize;
    this.present = new Set();
  }

  arrive(personId) {
    this.present.add(personId);
    return this.snapshot();
  }

  leave(personId) {
    this.present.delete(personId);
    return this.snapshot();
  }

  hasMinyan() {
    return this.present.size >= this.minyanSize;
  }

  snapshot() {
    return { count: this.present.size, hasMinyan: this.hasMinyan() };
  }
}

export default SynagogueRuntime;
