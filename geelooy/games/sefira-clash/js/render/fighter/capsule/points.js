/**
 * B"H
 * Split capsule visual rig pipeline.
 *
 * Chapter 132: raw gameplay bones enter as sparks, then locomotion, attack,
 * recoil, and correction dress them into a polished fighter vessel.
 */
import { point, good, mix, clamp } from './math.js';
import { applyLocomotionPose } from './locomotion.js';
import { applyAttackPose } from './attackPoses.js';
import { applyHitReaction } from './hitReactions.js';
import { correctCapsulePose } from './poseCorrection.js';

function boneTip(f, id, fallback) {
  const bone = f.bones?.[id];
  return good(bone?.tip) ? bone.tip : fallback;
}

function boneRoot(f, id, fallback) {
  const bone = f.bones?.[id];
  return good(bone?.root) ? bone.root : fallback;
}

export function capsulePoints(f) {
  const p = rawPoints(f);
  applyLocomotionPose(p, f);
  applyAttackPose(p, f);
  applyHitReaction(p, f);
  return correctCapsulePose(p);
}

function rawPoints(f) {
  const face = Math.sign(f.face || 1) || 1;
  const root = boneRoot(f, 'spine', point(f.x, f.y - 58));
  const chest = boneTip(f, 'spine', point(f.x, f.y - 126));
  const pelvis = point(root.x, root.y + 4);
  const leftShoulder = point(chest.x - 28, chest.y + 8);
  const rightShoulder = point(chest.x + 28, chest.y + 8);
  const leftHip = point(pelvis.x - 15, pelvis.y);
  const rightHip = point(pelvis.x + 15, pelvis.y);
  const leftElbow = mix(boneTip(f, 'leftUpperArm', point(leftShoulder.x - 18, leftShoulder.y + 32)), point(leftShoulder.x - 19, leftShoulder.y + 32), 0.72);
  const rightElbow = mix(boneTip(f, 'rightUpperArm', point(rightShoulder.x + 18, rightShoulder.y + 32)), point(rightShoulder.x + 19, rightShoulder.y + 32), 0.72);
  const leftKnee = mix(boneTip(f, 'leftThigh', point(leftHip.x - 11, leftHip.y + 41)), point(leftHip.x - 11, leftHip.y + 41), 0.68);
  const rightKnee = mix(boneTip(f, 'rightThigh', point(rightHip.x + 11, rightHip.y + 41)), point(rightHip.x + 11, rightHip.y + 41), 0.68);
  return {
    face,
    root,
    chest,
    neck: point(chest.x + face * 2, chest.y - 16),
    head: point(chest.x + face * 4, chest.y - 37),
    pelvis,
    leftShoulder,
    rightShoulder,
    leftHip,
    rightHip,
    leftElbow,
    rightElbow,
    leftHand: clampHand(leftShoulder, boneTip(f, 'leftLowerArm', point(leftShoulder.x - 28, leftShoulder.y + 62))),
    rightHand: clampHand(rightShoulder, boneTip(f, 'rightLowerArm', point(rightShoulder.x + 28, rightShoulder.y + 62))),
    leftKnee,
    rightKnee,
    leftFoot: clampFoot(leftHip, boneTip(f, 'leftCalf', point(leftHip.x - 15, f.y + 2))),
    rightFoot: clampFoot(rightHip, boneTip(f, 'rightCalf', point(rightHip.x + 15, f.y + 2)))
  };
}

function clampHand(shoulder, raw) {
  return point(clamp(raw.x, shoulder.x - 54, shoulder.x + 54), clamp(raw.y, shoulder.y + 22, shoulder.y + 72));
}

function clampFoot(hip, raw) {
  return point(clamp(raw.x, hip.x - 48, hip.x + 48), clamp(raw.y, hip.y + 62, hip.y + 86));
}
