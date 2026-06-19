/* B”H */
import { LayerRegistry } from './layers/LayerRegistry.js';
import { LayerSorter } from './layers/LayerSorter.js';
import { LayerRenderer } from './layers/LayerRenderer.js';

export class LayerManager {
  constructor() {
    this.registry = new LayerRegistry();
  }

  add(layer) {
    this.registry.add(layer);
  }

  draw(ctx, data) {
    const sorted = LayerSorter.sort(this.registry.getAll());
    LayerRenderer.render(ctx, sorted, data);
  }
}
