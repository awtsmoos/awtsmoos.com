/**
 * B"H
 * Chapter 34: Letters Burned Softly Above The Street.
 */

export class TorahEnergyOverlayRuntime {
  constructor() {
    this.auras = new Map();
  }

  bless(targetId, intensity = 1, source = 'mitzvah') {
    const aura = { targetId, intensity, source, visible: intensity > 0 };
    this.auras.set(targetId, aura);
    return aura;
  }

  fade(targetId, amount = 0.25) {
    const aura = this.auras.get(targetId) || { targetId, intensity: 0, source: 'none' };
    return this.bless(targetId, Math.max(0, aura.intensity - amount), aura.source);
  }

  snapshot() {
    return [...this.auras.values()];
  }
}

export default TorahEnergyOverlayRuntime;
