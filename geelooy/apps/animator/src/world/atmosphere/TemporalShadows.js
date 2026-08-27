
// B"H
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';

/**
 * @file TemporalShadows.js
 * @description
 * THE SHADOWS OF EMANATION (Tzel HaZman).
 * B"H
 * 
 * Shadows are not static ellipses under feet. As the sun sets, the angle of the 
 * light shears and stretches the shadow across the ground plane. 
 * This class calculates the universal Skew and Scale matrix to warp all ground 
 * shadows dynamically based on `timeOfDay`.
 */
export class TemporalShadows {
  /**
   * @function getMatrix
   * @description Returns the skew and scale factors for the ground plane.
   * @param {number} timeOfDay - 0.0 (Morning) to 1.0 (Night).
   * @returns {Object} Transform modifiers.
   */
  static getMatrix(timeOfDay) {
    // 0.5 is High Noon (Sun directly overhead). 
    // < 0.5 casts shadows Right. > 0.5 casts shadows Left.
    const sunAngle = (timeOfDay - 0.5) * Math.PI; // roughly -90 to +90 degrees

    // The length of the shadow multiplies as the sun nears the horizon.
    // At noon (0.5), length is minimal. At dusk/dawn, it approaches infinity.
    const distanceFromNoon = Math.abs(timeOfDay - 0.5);
    const stretch = 1.0 + Math.pow(distanceFromNoon * 2, 2) * 5; 

    // Calculate Skew X based on the sun's angle
    const skewX = Math.sin(sunAngle) * 2;

    // Opacity fades as night falls (timeOfDay > 0.8)
    let opacity = 0.4;
    if (timeOfDay > 0.7) opacity = 0.4 * (1 - ((timeOfDay - 0.7) * 3.33));

    return {
      skewX: skewX,
      scaleY: stretch,
      alpha: Math.max(0, opacity)
    };
  }

  /**
   * @function buildCharacterShadow
   * @description Draws the skewed, stretched shadow beneath an entity.
   */
  static buildCharacterShadow(x, y, scale, timeOfDay, bob) {
    const matrix = this.getMatrix(timeOfDay);
    if (matrix.alpha <= 0) return null;

    // As the character jumps (bob increases), the shadow shrinks and fades
    const altitude = Math.abs(bob);
    const jumpScale = Math.max(0.1, 1 - (altitude / 150));
    
    const finalW = 100 * scale * jumpScale;
    const finalH = 20 * scale * jumpScale * matrix.scaleY;

    // Apply the shear matrix transform to the ellipse
    return {
      type: 'ellipse',
      id: `shadow_${x}`,
      x: 0, 
      y: 0,
      rx: finalW,
      ry: finalH,
      rotation: 0,
      style: { fill: `rgba(0,0,0,${matrix.alpha * jumpScale})` },
      transform: {
        x: x + (matrix.skewX * 20), // Offset X based on skew origin
        y: y + 10,
        scaleX: 1,
        scaleY: 1,
        skewX: matrix.skewX 
      }
    };
  }
}
