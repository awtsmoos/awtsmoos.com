// B"H
export class LootInventoryBridge { constructor(seed = {}) { this.inventory = { ...seed }; } addDrops(drops = []) { for (const d of drops) this.inventory[d.item] = (this.inventory[d.item] || 0) + (d.amount || 1); return this.snapshot(); } snapshot() { return { inventory:{ ...this.inventory } }; } }
export default LootInventoryBridge;
