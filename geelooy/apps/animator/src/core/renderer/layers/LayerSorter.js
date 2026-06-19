/* B”H */
export class LayerSorter {
  static sort(layers) {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex);
  }
}
