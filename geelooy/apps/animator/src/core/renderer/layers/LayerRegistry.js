/* B”H */
export class LayerRegistry {
  constructor() {
    this.layers = [];
  }

  add(layer) {
    this.layers.push(layer);
  }

  getAll() {
    return this.layers;
  }
}
