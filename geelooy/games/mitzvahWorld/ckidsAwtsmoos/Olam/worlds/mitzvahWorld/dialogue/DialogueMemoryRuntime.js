// B"H
/** @file DialogueMemoryRuntime.js @description NPC dialogue memory without optional/nullish syntax. */
export class DialogueMemoryRuntime {
  constructor() { this.memory = new Map(); }
  ensure(npcId) { if (!this.memory.has(npcId)) this.memory.set(npcId, {}); return this.memory.get(npcId); }
  get(npcId, key, fallback = null) { const data = this.memory.get(npcId); return data && data[key] !== undefined ? data[key] : fallback; }
  set(npcId, key, value) { const data = this.ensure(npcId); data[key] = value; return value; }
  increment(npcId, key, amount = 1) { const current = Number(this.get(npcId, key, 0)) || 0; return this.set(npcId, key, current + amount); }
}
export default DialogueMemoryRuntime;
