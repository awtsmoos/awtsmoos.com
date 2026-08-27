// B"H

/**
 * @file LayerPriorityMap.js
 * @description
 * Which layer owns which body region. This is why walking can keep the legs
 * while speech owns mouth/head rhythm and waving owns one arm.
 */
export const LayerPriorityMap = {
  legs: ['locomotion', 'balance'],
  feet: ['locomotion'],
  hips: ['locomotion', 'balance', 'gesture'],
  torso: ['balance', 'locomotion', 'speech', 'gesture'],
  leftArm: ['gesture', 'prop', 'locomotion', 'speech'],
  rightArm: ['gesture', 'prop', 'locomotion', 'speech'],
  head: ['gaze', 'speech', 'emotion', 'balance'],
  eyes: ['gaze', 'emotion', 'speech'],
  brows: ['emotion', 'speech'],
  mouth: ['speech', 'emotion'],
  face: ['emotion', 'speech', 'gaze']
};