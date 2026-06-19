// B"H
export class FacePoseRenderBridge {
  static from(facePose = {}, data = {}) {
    const brows = facePose.brows || {}, eyes = facePose.eyes || {}, mouth = facePose.mouth || {}, cheeks = facePose.cheeks || {};
    return {
      eyeOpenAmount: this.clamp(Number(eyes.openness ?? 1) - Number(eyes.blink || 0), 0.06, 1.24),
      blinkAmount: this.clamp(Number(eyes.blink || data.blinkNow || 0), 0, 1),
      squintAmount: this.clamp(Number(eyes.squint || 0), -0.15, 0.7),
      pupilOffsetX: this.clamp(Number(eyes.dartX || 0), -0.6, 0.6),
      pupilOffsetY: this.clamp(Number(eyes.dartY || 0), -0.4, 0.4),
      browInner: this.clamp(Number(brows.innerRaise || 0), -1, 1),
      browOuter: this.clamp(Number(brows.outerRaise || 0), -1, 1),
      browSqueeze: this.clamp(Number(brows.squeeze || 0), 0, 1),
      browTilt: this.clamp(Number(brows.tilt || 0), -1, 1),
      mouthOpenAmount: this.clamp(Number(mouth.open ?? data.mouthOpen ?? 0), 0, 1),
      mouthSmileAmount: this.clamp(Number(mouth.smile || data.mouthSmile || 0) - Number(mouth.frown || 0) * 0.5, -0.7, 1),
      mouthJawAmount: this.clamp(Number(mouth.jaw || 0), 0, 1),
      cheekRaiseAmount: this.clamp(Number(cheeks.raise || 0), 0, 1),
      blushAmount: this.clamp(Number(cheeks.blush || 0), 0, 1)
    };
  }
  static clamp(v, min, max) { return Math.max(min, Math.min(max, Number.isFinite(v) ? v : min)); }
}
