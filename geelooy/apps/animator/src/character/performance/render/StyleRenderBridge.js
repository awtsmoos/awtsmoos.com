// B"H
export class StyleRenderBridge {
  static from(data = {}) {
    const scale = Math.abs(Number(data.position?.scale ?? data.scale ?? 1));
    return { lineWeight: Math.max(1.8, Math.min(3.8, 2.7 * scale)), cheekVisible: data.styleProfile !== 'flat', clothingFolds: data.styleProfile !== 'simple', hairDetail: data.expressionProfile !== 'minimal' };
  }
}
