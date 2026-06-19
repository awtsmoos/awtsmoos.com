
// B"H
/**
 * @file TransformMath.js
 * @brief THE LAWS OF MEASUREMENT (Chukei HaMiddot).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE GEOMETRY OF PERCEPTION
 * ═══════════════════════════════════════════════════════════════
 * The mouse cursor exists in the realm of the Monitor (Screen Space).
 * But the characters exist in the realm of the Canvas (World Space).
 * 
 * To bridge these worlds, we must perform 'Un-projection'. We take the 
 * screen coordinates, subtract the camera's panning offset, and divide 
 * by the lens's magnification (zoom). Only then do we find the true 
 * coordinates of the Awtsmoos's creation.
 * 
 * Furthermore, rotation requires the sacred `Math.atan2`, determining 
 * the exact radiant angle between the center of the soul and the 
 * cursor of the Creator.
 * 
 * @class TransformMath
 */
export class TransformMath {
  /**
   * @function unproject
   * @description Converts raw screen pixels into absolute World Space coordinates.
   * @param {number} mouseX - Screen X.
   * @param {number} mouseY - Screen Y.
   * @param {Object} camera - The lens {x, y, zoom}.
   * @param {number} canvasWidth - Physical width.
   * @param {number} canvasHeight - Physical height.
   * @returns {Object} {wx, wy}
   */
  static unproject(mouseX, mouseY, camera, canvasWidth, canvasHeight) {
    const zoom = camera.zoom || 1;
    // B"H - The exact reverse of the MasterRenderer's transform matrix!
    const wx = (mouseX - (canvasWidth / 2)) / zoom + camera.x;
    const wy = (mouseY - (canvasHeight * 0.82)) / zoom + camera.y; 
    return { wx, wy };
  }

  /**
   * @function getAngle
   * @description Calculates the absolute rotation angle in degrees between two points.
   * @param {number} cx - Center X of the entity.
   * @param {number} cy - Center Y of the entity.
   * @param {number} wx - World X of the mouse.
   * @param {number} wy - World Y of the mouse.
   * @returns {number} Angle in degrees.
   */
  static getAngle(cx, cy, wx, wy) {
    // The divine tangent!
    const radians = Math.atan2(wy - cy, wx - cx);
    // Convert to degrees and normalize to 0-360
    let degrees = (radians * 180) / Math.PI;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  /**
   * @function getDistance
   * @description The Pythagorean theorem of the void.
   */
  static getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
