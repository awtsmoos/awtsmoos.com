// B"H

/**
 * @file CameraTargetResolver.js
 * @description
 * Chapter: The target stopped disappearing inside arrays.
 * Cameras may target actors, props, or groups. Props sometimes arrive as arrays
 * and sometimes as maps; this resolver accepts both so inserts and action shots
 * never fall back to stale centers.
 */
export class CameraTargetResolver {
  /**
   * Resolves camera state from a rig and world.
   *
   * @param {Object} rig - Camera rig.
   * @param {Object} world - World data.
   * @returns {Object} Camera state.
   */
  static resolve(rig, world = {}) {
    const base = rig.toState ? rig.toState() : { ...rig };
    const chars = world.characters || {};
    const props = this.mapById(world.props || {});

    if (rig.targetMode === 'actor' && rig.targetActors?.length) {
      const point = this.center(rig.targetActors.map((id) => chars[id]?.position).filter(Boolean));
      if (point) this.applyPoint(base, point);
    }

    if (rig.targetMode === 'multi' && rig.targetActors?.length) {
      const point = this.center(rig.targetActors.map((id) => chars[id]?.position).filter(Boolean));
      if (point) this.applyPoint(base, point);
    }

    if (rig.targetMode === 'prop' && rig.targetProp && props[rig.targetProp]) {
      const prop = props[rig.targetProp];
      base.x = Number(prop.x || prop.position?.x || base.x || 0);
      if (Number.isFinite(prop.y) || Number.isFinite(prop.position?.y)) base.y = Number(prop.y ?? prop.position.y);
    }

    return base;
  }

  /** @param {Object} base @param {Object} point @returns {void} */
  static applyPoint(base, point) {
    base.x = Number(point.x || 0);
  }

  /** @param {Array<Object>} points - Points. @returns {Object|null} */
  static center(points) {
    if (!points.length) return null;
    return {
      x: points.reduce((sum, p) => sum + Number(p.x || 0), 0) / points.length,
      y: points.reduce((sum, p) => sum + Number(p.y || 0), 0) / points.length
    };
  }

  /** @param {Object|Array<Object>} value - Props. @returns {Object} Map. */
  static mapById(value) {
    if (!Array.isArray(value)) return value || {};
    return value.reduce((out, item) => {
      if (item?.id) out[item.id] = item;
      return out;
    }, {});
  }
}
