
// B"H
/**
 * @file AABBResolver.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE TIGHTENED MEASUREMENT
 * ═══════════════════════════════════════════════════════════════
 */
export class AABBResolver {
  static calculate(targets) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    if (!targets || targets.length === 0) {
      return { minX: -100, maxX: 100, minY: -300, maxY: 0, width: 200, height: 300, centerX: 0, centerY: -150 };
    }

    targets.forEach(char => {
      const px = char.position?.x || 0;
      const py = char.position?.y || 0;
      const scale = (char.position?.scale || 1.0) * (char.mod?.body || 1.0);

      // B"H - Biological Reality: A character is roughly 320px tall at 1.0 scale
      // including hats. Width is about 120px.
      const halfW = 70 * scale; 
      const height = 330 * scale; 

      const left = px - halfW;
      const right = px + halfW;
      const bottom = py; 
      const top = py - height;

      if (left < minX) minX = left;
      if (right > maxX) maxX = right;
      if (top < minY) minY = top;
      if (bottom > maxY) maxY = bottom;
    });

    return {
      minX, maxX, minY, maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }
}
