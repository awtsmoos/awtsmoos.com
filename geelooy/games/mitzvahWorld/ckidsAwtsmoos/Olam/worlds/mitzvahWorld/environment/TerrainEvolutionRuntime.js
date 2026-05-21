/**
 * B"H
 * Chapter 44: The Ground Remembered Rain And Feet.
 */

export class TerrainEvolutionRuntime {
  constructor() {
    this.cells = new Map();
  }

  mark(cellId, patch) {
    const cell = this.cells.get(cellId) || { wear: 0, wetness: 0 };
    const updated = { ...cell, ...patch };
    this.cells.set(cellId, updated);
    return updated;
  }

  stepOn(cellId) {
    const cell = this.cells.get(cellId) || { wear: 0, wetness: 0 };
    return this.mark(cellId, { wear: cell.wear + 1 });
  }

  rain(amount = 1) {
    for (const [id, cell] of this.cells) this.mark(id, { wetness: cell.wetness + amount });
    return [...this.cells.values()];
  }
}

export default TerrainEvolutionRuntime;
