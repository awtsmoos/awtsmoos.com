// B"H
/** @file DialogueMemoryRuntime.js @description Villagers remember words, favors, rumors, and reputation. */
export class DialogueMemoryRuntime {
  constructor() {
    this.memory = new Map();
    this.rumors = [];
  }

  ensure(npcId) {
    if (!this.memory.has(npcId)) this.memory.set(npcId, { visits:0, reputation:0, facts:[], rumors:[] });
    return this.memory.get(npcId);
  }

  get(npcId, key, fallback = null) {
    const data = this.memory.get(npcId);
    return data && data[key] !== undefined ? data[key] : fallback;
  }

  set(npcId, key, value) {
    const data = this.ensure(npcId);
    data[key] = value;
    return value;
  }

  increment(npcId, key, amount = 1) {
    return this.set(npcId, key, (Number(this.get(npcId, key, 0)) || 0) + amount);
  }

  remember(npcId, fact, value = undefined) {
    if (arguments.length >= 3) return this.set(npcId, fact, value);
    const data = this.ensure(npcId);
    data.facts.unshift({ fact, at:Date.now() });
    data.facts = data.facts.slice(0, 20);
    return data;
  }

  recall(npcId, key, fallback = null) {
    return this.get(npcId, key, fallback);
  }

  rumor(text, source = "world") {
    const record = { text, source, at:Date.now(), strength:1 };
    this.rumors.unshift(record);
    this.rumors = this.rumors.slice(0, 50);
    return record;
  }

  snapshot() {
    return { npcs:this.memory.size, rumors:this.rumors.length };
  }
}

export default DialogueMemoryRuntime;
