/**
 * B"H
 * Full hyper-real humanoid animation solver.
 *
 * The Awtsmoos renews body, force, contact, recoil, fear, rhythm, cloth, mass,
 * feet, gait, breath, intent, recovery, personality, degradation, micro motion,
 * impact, and readable pose from nothing every instant. Visual-only: no gameplay
 * physics, damage, AI, knockback, or attack timing authority.
 */
import { animationState } from './animationState.js';
import { poseIntent } from './poseIntent.js';
import { basePose } from './basePose.js';
import { bindAll } from './bindPose.js';
import { applyInfluences, collectInfluences } from './compose/poseComposer.js';
import { poseReadback } from './compose/poseReadback.js';
import { updateMotionMemory } from './motion/motionMemory.js';
import { motionMetrics } from './motion/motionMetrics.js';
import { balanceModel } from './motion/balanceModel.js';
import { bodyArchetype } from './style/bodyArchetype.js';
import { movementSignature } from './style/movementSignature.js';
import { clothingArchetype } from './style/clothingArchetype.js';
import { rhythmSignature } from './style/rhythmSignature.js';
import { damageSignature } from './style/damageSignature.js';
import { emotionSignature } from './style/emotionSignature.js';
import { bodyMass } from './physics/bodyMass.js';
import { forcePropagation } from './physics/forcePropagation.js';
import { forceInfluences } from './physics/forceInfluences.js';
import { torqueModel } from './physics/torqueModel.js';
import { recoilModel } from './physics/recoilModel.js';
import { jointInertia } from './physics/jointInertia.js';
import { updateLimbMemory } from './physics/limbMemory.js';
import { contactPose } from './contact/contactPose.js';
import { contactInfluences } from './contact/contactInfluences.js';
import { massPose } from './mass/massPose.js';
import { feetPose } from './feet/feetPose.js';
import { gaitPose } from './gait/gaitPose.js';
import { breathingPose } from './breathing/breathingPose.js';
import { intentPose } from './intent/intentPose.js';
import { recoveryPose } from './recovery/recoveryPose.js';
import { personalityPose } from './personality/personalityPose.js';
import { damagePose } from './damage/damagePose.js';
import { microPose } from './micro/microPose.js';
import { impactPose } from './impact/impactPose.js';
import { locomotionPose } from './locomotion/locomotionPose.js';
import { airPose } from './air/airPose.js';
import { landingPose } from './landing/landingPose.js';
import { combatPose } from './combat/combatPose.js';
import { emotionPose } from './emotion/emotionPose.js';
import { secondaryPose } from './secondary/secondaryPose.js';
import { ikLite } from './ik/ikLite.js';
import { stepClothState } from '../cloth/clothState.js';

export function solveSkeleton(f) {
  updateMotionMemory(f);
  const anim = animationState(f);
  const metrics = motionMetrics(f, anim);
  const intent = poseIntent(f, anim, metrics);
  const body = bodyArchetype(f);
  const style = movementSignature(f);
  const clothing = clothingArchetype(f);
  const rhythm = rhythmSignature(f);
  const damage = damageSignature(f);
  const emotion = emotionSignature(f, intent);
  const mass = bodyMass(f, body, metrics);
  const forces = forcePropagation(f, metrics, intent);
  const torque = torqueModel(f, metrics, intent);
  const recoil = recoilModel(f, metrics);
  const balance = balanceModel(f, metrics, intent);
  let pose = basePose(f, metrics, body, balance, anim, intent);
  f.poseSnapshot = poseReadback(pose);
  applyInfluences(pose, collectInfluences(contactInfluences(f, metrics, body), forceInfluences(f, metrics, intent, forces, body)));
  massPose(pose, f, metrics, body);
  contactPose(pose, f, metrics, body);
  feetPose(pose, f, metrics, body);
  personalityPose(pose, f, metrics, body);
  intentPose(pose, f, metrics, body, intent);
  gaitPose(pose, f, metrics, body, intent, damage);
  locomotionPose(pose, f, metrics, { ...style, rhythm, forces, torque }, body);
  airPose(pose, f, metrics, { ...style, rhythm, forces }, body, intent);
  landingPose(pose, f, metrics, body);
  combatPose(pose, f, metrics, body, { ...intent, forces, recoil, torque });
  impactPose(pose, f, metrics, body);
  damagePose(pose, f, body, damage);
  emotionPose(pose, f, { ...intent, damage, emotion }, style, body);
  recoveryPose(pose, f, metrics, body, intent);
  breathingPose(pose, f, body, intent, damage, rhythm);
  microPose(pose, f, metrics, body);
  secondaryPose(pose, f, metrics, { ...style, rhythm, forces, mass }, body);
  jointInertia(pose, f, body);
  ikLite(pose, f, metrics);
  bindAll(f, pose);
  updateLimbMemory(f, pose);
  f.anim = anim;
  f.poseIntent = intent;
  f.poseReadback = poseReadback(pose);
  f.visualStyle = { body, style, clothing, rhythm, damage, emotion, mass, forces, torque, recoil };
  f.poseClothAnchors = pose.clothAnchors;
  stepClothState(f, clothing, pose.clothAnchors);
}
