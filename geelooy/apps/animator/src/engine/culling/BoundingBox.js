
// B"H
export class BoundingBox {
  static get(entity) {
    if (!entity) return { w: 0, h: 0 };
    return {
      w: entity.w || entity.size || 100,
      h: entity.h || entity.size || 100
    };
  }
}
