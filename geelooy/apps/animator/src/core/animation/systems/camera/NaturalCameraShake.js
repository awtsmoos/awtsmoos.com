// B"H
export class NaturalCameraShake {
  static getOffset(time, intensity) {
    if (intensity <= 0.01) return { x: 0, y: 0 };

    // Intense harmonic fracturing
    const harmonicX = Math.sin(time * 0.0013) * Math.cos(time * 0.0031) * intensity * 2;
    const harmonicY = Math.cos(time * 0.0017) * Math.sin(time * 0.0029) * intensity * 2;

    // A violent noise function imitating bone-rattling shockwaves
    const shockX = (Math.random() - 0.5) * Math.pow(intensity, 1.5) * Math.sin(time * 0.2);
    const shockY = (Math.random() - 0.5) * Math.pow(intensity, 1.5) * Math.cos(time * 0.25);

    // Sudden psychotic jagged tear in the fabric
    let tearX = 0, tearY = 0;
    if (intensity > 2.5 && Math.random() > 0.9) {
      tearX = (Math.random() - 0.5) * intensity * 20;
      tearY = (Math.random() - 0.5) * intensity * 20;
    }

    return {
      x: harmonicX + shockX + tearX,
      y: harmonicY + shockY + tearY
    };
  }
}

