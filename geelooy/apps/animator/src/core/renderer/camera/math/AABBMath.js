
// B"H
/**
 * @file AABBMath.js
 * @brief THE BOUNDARIES OF PERCEPTION (Gevulot HaRe'iyah).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE TRUE STATURE OF MAN
 * ═══════════════════════════════════════════════════════════════
 * 
 * RECTIFICATION: The height was hardcoded to 300px, which failed 
 * to include the crown of the head and the height of the hats, 
 * causing the camera to decapitate the characters in close-ups. 
 * We have increased the stature to 420px to capture the full 
 * spiritual and physical presence of the souls.
 */
export class AABBMath {
  static calculate(entities) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    if (!entities || entities.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, centerX: 0, centerY: -100, width: 200, height: 400 };
    }

    entities.forEach(entity => {
      const px = entity.position?.x || 0;
      const py = entity.position?.y || 0;
      
      const totalScale = (entity.position?.scale || 1.0) * (entity.mod?.body || 1.0);
      
      // B"H - RECTIFIED DIMENSIONS
      const halfW = 120 * totalScale; // Wider to account for arm spans
      const height = 420 * totalScale; // Taller to include hats and hair apex

      if (px - halfW < minX) minX = px - halfW;
      if (px + halfW > maxX) maxX = px + halfW;
      
      // maxY is the ground (feet)
      if (py > maxY) maxY = py;
      // minY is the sky (head)
      if (py - height < minY) minY = py - height;
    });

    return {
      minX, maxX, minY, maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY)
    };
  }
}
