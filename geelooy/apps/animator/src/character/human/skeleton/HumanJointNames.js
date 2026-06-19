
// B"H

/**
 * @file HumanJointNames.js
 * @description
 * ============================================================================
 * CHAPTER: THE NAMES OF THE BONES BEFORE THEY WORE SKIN
 * ============================================================================
 *
 * Naming is order. Order is mercy. When every joint has one stable name, arms
 * no longer detach, heads no longer float, legs no longer vanish, and the body
 * becomes a readable vessel for animation.
 *
 * @module HumanJointNames
 */

/**
 * @constant HUMAN_JOINT_NAMES
 * @description
 * Canonical 2D human joint names.
 */
export const HUMAN_JOINT_NAMES = Object.freeze([
  'root',
  'pelvis',
  'spine',
  'chest',
  'neck',
  'head',
  'leftShoulder',
  'leftElbow',
  'leftWrist',
  'leftHand',
  'rightShoulder',
  'rightElbow',
  'rightWrist',
  'rightHand',
  'leftHip',
  'leftKnee',
  'leftAnkle',
  'leftFoot',
  'rightHip',
  'rightKnee',
  'rightAnkle',
  'rightFoot'
]);

/**
 * @constant HUMAN_BONE_PAIRS
 * @description
 * Parent-child bone relationships for debug rendering and IK sanity.
 */
export const HUMAN_BONE_PAIRS = Object.freeze([
  ['root', 'pelvis'],
  ['pelvis', 'spine'],
  ['spine', 'chest'],
  ['chest', 'neck'],
  ['neck', 'head'],
  ['chest', 'leftShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'],
  ['leftWrist', 'leftHand'],
  ['chest', 'rightShoulder'],
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightWrist'],
  ['rightWrist', 'rightHand'],
  ['pelvis', 'leftHip'],
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],
  ['leftAnkle', 'leftFoot'],
  ['pelvis', 'rightHip'],
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
  ['rightAnkle', 'rightFoot']
]);
