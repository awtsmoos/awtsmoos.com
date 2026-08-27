// B"H
export class IKEngine {
  static solveLeg(targetX, targetY, thighLen, calfLen) {
    // Law of cosines to find knee and hip angles
    const distSq = targetX * targetX + targetY * targetY;
    const dist = Math.sqrt(distSq);
    
    // Protect against over-extension
    const maxDist = thighLen + calfLen - 0.1;
    let clampedDistSq = distSq;
    let clampedX = targetX;
    let clampedY = targetY;
    if (dist > maxDist) {
      clampedX = (targetX / dist) * maxDist;
      clampedY = (targetY / dist) * maxDist;
      clampedDistSq = maxDist * maxDist;
    }

    // Cosine rule for knee angle
    let cosKnee = (clampedDistSq - thighLen * thighLen - calfLen * calfLen) / (2 * thighLen * calfLen);
    cosKnee = Math.max(-1, Math.min(1, cosKnee));
    // The knee in humans bends backwards
    const kneeAngle = Math.acos(cosKnee);

    // Alpha is the angle between thigh and the direct line to target
    let cosAlpha = (thighLen * thighLen + clampedDistSq - calfLen * calfLen) / (2 * thighLen * Math.sqrt(clampedDistSq));
    cosAlpha = Math.max(-1, Math.min(1, cosAlpha));
    const alpha = Math.acos(cosAlpha);

    // Beta is the angle of the direct line from origin
    const beta = Math.atan2(clampedX, clampedY);
    
    // Hip angle is beta + alpha
    const hipAngle = beta + alpha; 
    
    // Convert to degrees
    return {
      hip: hipAngle * (180 / Math.PI),
      knee: kneeAngle * (180 / Math.PI)
    };
  }
}
