/**
 * B"H
 * Emotion and damage posture orchestrator.
 *
 * The same motion must become fear, hunt, confidence, fatigue, and recovery.
 * These layers bend the visual body only, never the combat rules.
 */
import { damagePosture } from './damagePosture.js';
import { panicPose } from './panicPose.js';
import { huntPose } from './huntPose.js';
import { confidencePose } from './confidencePose.js';
import { recoverPose } from './recoverPose.js';
import { fatiguePose } from './fatiguePose.js';
import { fearOvercorrection } from './fearOvercorrection.js';

export function emotionPose(p, f, intent, style, body) {
  damagePosture(p, f, intent, body);
  fatiguePose(p, f, intent, body);
  panicPose(p, f, intent, body);
  fearOvercorrection(p, f, intent, body);
  huntPose(p, f, intent, body);
  confidencePose(p, f, intent, body);
  recoverPose(p, f, intent, body);
  return p;
}
