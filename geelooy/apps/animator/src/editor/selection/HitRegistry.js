// B"H

/**
 * @file HitRegistry.js
 * @description
 * Invisible hit bounds for selecting characters without drawing permanent boxes.
 */
export class HitRegistry {
  constructor() {
    this.items = [];
  }

  clear() {
    this.items.length = 0;
  }

  add(item) {
    if (item && item.id) this.items.push(item);
  }

  hit(x, y) {
    const reversed = [...this.items].reverse();
    return reversed.find(item => (
      x >= item.x &&
      x <= item.x + item.w &&
      y >= item.y &&
      y <= item.y + item.h
    )) || null;
  }
}