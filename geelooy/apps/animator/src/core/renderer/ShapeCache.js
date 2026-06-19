/* B”H */
export class ShapeCache {
  static cache = new Map();

  static getPath(key, generatorFn) {
    if (!this.cache.has(key)) {
      const path = new Path2D();
      generatorFn(path);
      this.cache.set(key, path);
    }
    return this.cache.get(key);
  }
}
