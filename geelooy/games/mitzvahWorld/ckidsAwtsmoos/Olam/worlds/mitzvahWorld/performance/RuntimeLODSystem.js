// B"H
/** @file RuntimeLODSystem.js @description Near sparks dance, far sparks become statistics, and 60 FPS remains king. */
export class RuntimeLODSystem {
  constructor(options = {}) {
    const { near = 28, mid = 85, far, targetFps = 60 } = options;
    this.near = near;
    this.mid = mid;
    this.far = far ?? mid;
    this.hasFarBand = far !== undefined;
    this.targetFps = targetFps;
    this.lastPressure = 0;
  }

  tier(distance = 0) {
    if (distance <= this.near) return "near";
    if (distance <= this.mid) return "mid";
    if (this.hasFarBand && distance <= this.far) return "far";
    return "sleep";
  }

  hzFor(tier) {
    return tier === "near" ? 30 : tier === "mid" ? 4 : tier === "far" ? 1 : 0;
  }

  visibleFor(tier) {
    return tier !== "sleep";
  }

  pressure(frameMs = 16.67) {
    this.lastPressure = Math.max(0, frameMs / (1000 / this.targetFps));
    return this.lastPressure;
  }

  apply(object, distance, frameMs = 16.67) {
    const tier = this.tier(distance), hz = this.hzFor(tier);
    object.userData = { ...(object.userData || {}), lodTier:tier, updateHz:hz, statistical:tier === "sleep", fpsPressure:this.pressure(frameMs) };
    object.visible = this.visibleFor(tier);
    return tier;
  }

  shouldUpdate(object, now = performance?.now?.() || Date.now()) {
    const u = object?.userData || {}, hz = Number(u.updateHz || 0);
    if (!hz) return false;
    const ms = 1000 / hz;
    if (!u.__lodLast || now - u.__lodLast >= ms) { u.__lodLast = now; return true; }
    return false;
  }
}

export function createRuntimeLODSystem(options) {
  return new RuntimeLODSystem(options);
}

export default RuntimeLODSystem;
