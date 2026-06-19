// B"H
export class EyeMath {
  static computePupil(h, dilationParams) {
    const baseSize = h * 0.22;
    const dilation = 1.0 + (dilationParams.surprise || 0) * 0.5 - (dilationParams.concentration || 0) * 0.3;
    return { size: baseSize, rad: baseSize * dilation };
  }

  static computeScleraBound(h, surprise, joy) {
    let scleraH = h;
    let baseDrop = 0.45;
    if (surprise > 0.5) {
      scleraH *= 1.2;
      baseDrop = 0.2;
    }
    if (joy > 0.5) scleraH *= 0.85;
    return { scleraH, eyelidDropLevel: baseDrop };
  }
}
