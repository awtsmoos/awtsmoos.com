// B"H
/** EretzGround: a procedural patch of land with repeated grass breath. */
export class EretzGround {
  constructor({ size = 96, tile = 16 } = {}) { this.size = size; this.tile = tile; this.type = 'eretz'; }
  toRenderState() { return { type: this.type, size: this.size, tile: this.tile }; }
}
