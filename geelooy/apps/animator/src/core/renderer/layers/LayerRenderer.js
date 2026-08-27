/* B”H */
export class LayerRenderer {
  static render(ctx, layers, data) {
    layers.forEach(layer => {
      // Check if this layer's visibility is toggled off in the data
      if (data.layers && data.layers[layer.id] === false) return;
      layer.draw(ctx, data);
    });
  }
}
