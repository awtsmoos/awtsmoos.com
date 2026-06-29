// B"H
export class FacialPerformanceEngine {
  static build(characters = {}, micro = {}, attention = {}) {
    return Object.fromEntries(Object.keys(characters).map(id => [id, this.track(micro[id] || [], attention[id] || [])]));
  }
  static track(micro, attention) {
    return micro.map((mark, index) => ({
      at: mark.at,
      blink: mark.face === 'blink_hold' ? 'slow_hold' : 'natural',
      brow: mark.intensity > .7 ? 'pinch_high' : 'soft_asymmetry',
      mouth: mark.face.includes('smile') ? 'relief_curve' : 'held_breath_line',
      saccadeTarget: attention[index % Math.max(1, attention.length)]?.eyes || 'storm_lantern',
      breath: index % 2 ? 'release' : 'hold'
    }));
  }
}
