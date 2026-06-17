// B"H
/** Index generated objects by id and type so the universe can remember what manifested. */
export class UniverseGeneratedObjectIndex {
  constructor(commands = []) { this.byId = new Map(); this.byType = new Map(); commands.forEach(c => this.add(c)); }
  add(command = {}) { const id = command.id || `${command.type || "object"}_${this.byId.size + 1}`; const row = { id, type:command.type || "unknown", command }; this.byId.set(id, row); if (!this.byType.has(row.type)) this.byType.set(row.type, []); this.byType.get(row.type).push(row); return row; }
  snapshot() { return { total:this.byId.size, ids:[...this.byId.keys()], byType:Object.fromEntries([...this.byType].map(([k, v]) => [k, v.length])) }; }
}
export default UniverseGeneratedObjectIndex;
