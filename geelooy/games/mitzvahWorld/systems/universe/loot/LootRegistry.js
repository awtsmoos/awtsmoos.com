// B"H
export class LootRegistry { constructor(tables = []) { this.tables = new Map(); tables.forEach(t => this.add(t)); } add(table = {}) { const id = table.animalId || table.targetId || table.id || `loot_${this.tables.size+1}`; this.tables.set(id, table); return table; } snapshot() { return { tables:this.tables.size, ids:[...this.tables.keys()] }; } }
export default LootRegistry;
