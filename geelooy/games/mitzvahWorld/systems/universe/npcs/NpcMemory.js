// B"H
export class NpcMemory { constructor(seed = []) { this.memories = new Set(seed); } remember(key) { this.memories.add(key); return this.snapshot(); } has(key) { return this.memories.has(key); } snapshot() { return { memories:[...this.memories] }; } }
export function npcMemory(seed = []) { return new NpcMemory(seed); }
