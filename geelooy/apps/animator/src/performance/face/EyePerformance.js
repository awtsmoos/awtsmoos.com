// B"H
export class EyePerformance {
  static compose({ blink = 0, dart = { x: 0, y: 0 }, attention = null } = {}) {
    return { blink, dartX: dart.x || 0, dartY: dart.y || 0, focusTarget: attention?.id || attention || null };
  }
}
