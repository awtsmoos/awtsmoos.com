// B"H

export class FoodActionPresets {
  static hop(id, from, to, start, end) { return { type: 'prop', id, propType: id, action: 'hop', from, to, height: 34, start, end }; }
  static roll(id, from, to, start, end) { return { type: 'prop', id, propType: id, action: 'roll', from, to, height: 8, start, end }; }
  static bite(actor, food, start, end) { return { type: 'character', id: actor, start, end, gesture: 'bite', heldPropId: food, mouthOpen: 0.85, emotion: 'happy' }; }
  static sparkle(id, at, start, end) { return { type: 'prop', id, propType: 'sparkle', action: 'sparkle', from: at, to: at, start, end, size: 12 }; }
}
