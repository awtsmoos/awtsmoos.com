/**
 * B"H
 * Chapter 41: The Speaker Remembered A Spark.
 */

export class DialogueMemoryRuntime {
  constructor() {
    this.memory = new Map();
  }

  remember(npcId, key, value) {
    const record = this.memory.get(npcId) || {};
    record[key] = value;
    this.memory.set(npcId, record);
    return { npcId, key, value };
  }

  recall(npcId, key, fallback = null) {
    return this.memory.get(npcId)?.[key] ?? fallback;
  }

  context(npcId) {
    return { ...(this.memory.get(npcId) || {}) };
  }
}

export default DialogueMemoryRuntime;
