// B"H
export class NpcRelationshipRuntime { constructor(seed = {}) { this.values = { ...seed }; } add(target, delta = 0) { this.values[target] = (this.values[target] || 0) + delta; return this.values[target]; } snapshot() { return { relationships:{ ...this.values } }; } }
export default NpcRelationshipRuntime;
