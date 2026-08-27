
// B"H
/**
 * @file walk.js
 * @description
 * THE DANCE OF ASIYAH (Action).
 * B"H
 * HYPER REALISTIC SWAGGER: The Moonwalk is dead. We invoke PlantedIK 
 * to plant the feet directly onto the earth, pulling the hips over them.
 */

import { PlantedIK } from '../../../character/physics/PlantedIK.js';

export const WALK_BEHAVIOR = (time) => {
  const speed = 0.005;
  const strideLen = 50;
  const thighLen = 75;
  const calfLen = 75;
  
  // B"H - Calculate absolute world anchors for feet
  const footXL = PlantedIK.getStrideAnchor(time, strideLen, false);
  const footXR = PlantedIK.getStrideAnchor(time, strideLen, true);
  
  const cycle = (time * speed) % (Math.PI * 2);
  const sin = Math.sin(cycle);
  
  // Y-Lift during swing phase (Parabolic hop)
  const footYL = footXL < 0 ? (140 - Math.sin((footXL / -strideLen) * Math.PI) * 20) : 140;
  const footYR = footXR < 0 ? (140 - Math.sin((footXR / -strideLen) * Math.PI) * 20) : 140;

  const leftLeg = PlantedIK.solvePlantedLeg(0, 0, footXL, footYL, thighLen, calfLen);
  const rightLeg = PlantedIK.solvePlantedLeg(0, 0, footXR, footYR, thighLen, calfLen);

  // Body Bob (Mass transfer)
  const bob = Math.abs(Math.sin(cycle * 2)) * 15;

  return {
    hipL: leftLeg.hipAngle, kneeL: leftLeg.kneeAngle,
    hipR: rightLeg.hipAngle, kneeR: rightLeg.kneeAngle,
    armL: -sin * 45, elbowL: 20 + Math.abs(sin)*20,
    armR: sin * 45, elbowR: 20 + Math.abs(sin)*20,
    bob,
    torsoSway: sin * 5,
    footRollL: 0, footRollR: 0
  };
};
