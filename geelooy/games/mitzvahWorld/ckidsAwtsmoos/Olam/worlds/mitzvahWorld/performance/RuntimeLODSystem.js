/**
 * B"H
 * Chapter 39: Far Sparks Slept So Near Sparks Could Dance.
 */

export class RuntimeLODSystem {
  constructor({ near = 20, mid = 60 } = {}) {
    this.near = near;
    this.mid = mid;
  }

  tier(distance) {
    if (distance <= this.near) return 'full';
    if (distance <= this.mid) return 'simple';
    return 'sleep';
  }

  apply(object, distance) {
    const tier = this.tier(distance);
    object.userData = { ...(object.userData || {}), lodTier: tier };
    object.visible = tier !== 'sleep';
    return tier;
  }
}

export default RuntimeLODSystem;
