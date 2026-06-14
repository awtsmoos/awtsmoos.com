/**
 * B"H
 * Hero part map.
 *
 * Chapter 194: each body part is named and paired so render modules can stay
 * small, split, and loyal to the mockup.
 */
export const ARM_PARTS = Object.freeze([
  Object.freeze({ side: 'left', shoulder: 'leftShoulder', elbow: 'leftElbow', hand: 'leftHand' }),
  Object.freeze({ side: 'right', shoulder: 'rightShoulder', elbow: 'rightElbow', hand: 'rightHand' })
]);

export const LEG_PARTS = Object.freeze([
  Object.freeze({ side: 'left', hip: 'leftHip', knee: 'leftKnee', foot: 'leftFoot', sign: -1 }),
  Object.freeze({ side: 'right', hip: 'rightHip', knee: 'rightKnee', foot: 'rightFoot', sign: 1 })
]);
