// B"H
/** Modifier descriptor: deterministic authoring assistance, never random generation. */
export class Modifier {
  constructor({ type, options = {} } = {}) { this.kind = 'modifier'; this.type = type; this.options = options; }
  toJSON() { return { ...this }; }
}
