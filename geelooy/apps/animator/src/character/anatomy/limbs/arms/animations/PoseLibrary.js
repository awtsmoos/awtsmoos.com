// B"H
/**
 * @class PoseLibrary
 * @description
 * THE KATALON OF POSTURES.
 * B"H
 */
export class PoseLibrary {
  static apply(data, side, baseAngles) {
    let { upper, lower } = baseAngles;
    let ikTarget = null;
    let bendDir = side === 'left' ? -1 : 1; // Left outward bend, Right outward bend
    
    // B"H - Dynamic adjustments based on soul's state
    if (data.isScared) {
       upper -= 20;
       lower += 80;
    }
    
    if (data.isProud) {
       upper += 15;
    }

    if (side === 'right') {
      if (data.isDrinking) {
        // Bring hand to mouth
        ikTarget = { x: 0, y: -65 }; // Near face (relative to spine/head approx)
        bendDir = 1; // Needs to bend sharply
      }
      if (data.isTexting) {
        // Hold phone at chest
        ikTarget = { x: -20, y: 15 };
        bendDir = -1; // Bend inward across chest
      }
      if (data.isWaving) {
        // Hand up high
        ikTarget = { x: 50, y: -90 };
        bendDir = 1; // Bend outward
        // Modulate with animation over time if desired, though normally handled by swing/kinematics.
      }
    } else { // left arm
      if (data.isTexting) {
        // Two hands on phone occasionally or resting
        ikTarget = { x: 20, y: 15 };
        bendDir = 1; // Bend inward
      }
    }

    return { upper, lower, ikTarget, bendDir };
  }
}
