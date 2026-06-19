// B"H
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export const BONE_MATH = {
  DEG_TO_RAD,
  RAD_TO_DEG,
  
  // B"H - Calculates the tip of a limb segment given degrees
  calcTip: (pX, pY, deg, len) => {
    const rad = deg * DEG_TO_RAD;
    return {
      x: pX + Math.sin(rad) * len,
      y: pY + Math.cos(rad) * len
    };
  },
  
  // B"H - Inverse Kinematics for a 2-bone limb
  // 0 degrees is DOWN (y increases downwards). Math.atan2(x, y) maps to this naturally.
  // bendDirection corresponds to whether the elbow bends inward or outward.
  solveIK: (targetX, targetY, length1, length2, bendDir = 1) => {
    // Treat the shoulder as (0,0). Target is relative to shoulder.
    const distSq = targetX * targetX + targetY * targetY;
    const dist = Math.sqrt(distSq);

    // If target is out of reach, stretch towards it
    if (dist > length1 + length2) {
      const angle = Math.atan2(targetX, targetY) * RAD_TO_DEG;
      return { upper: angle, lower: 0 };
    }

    // Law of cosines to find inner angle of the elbow
    let cosAngle2 = (distSq - length1 * length1 - length2 * length2) / (2 * length1 * length2);
    cosAngle2 = Math.max(-1, Math.min(1, cosAngle2));
    
    // bendRad is the angle by which the second bone deviates from the straight line
    // (0 when straight, increasing as it bends).
    const bendRad = Math.acos(cosAngle2);
    const lowerBendRad = bendRad * bendDir;

    // The angle from the shoulder to the wrist
    const wristAngleRad = Math.atan2(targetX, targetY);

    // The inner angle of the shoulder bone to the wrist-shoulder line
    const shoulderInnerRad = Math.asin((length2 * Math.sin(bendRad)) / dist);

    // The full upper angle relative to the world
    const upperRad = wristAngleRad - (shoulderInnerRad * bendDir);

    return { 
      upper: upperRad * RAD_TO_DEG, 
      lower: lowerBendRad * RAD_TO_DEG 
    };
  }
};
