// B"H
/** @file GuideIdleAnimation.js @description Chapter 432: Idle/talk animation labels for future procedural-core binding. */
import { GUIDE_HUMAN_MANIFEST } from './GuideHumanManifest.js';
export function guideAnimationPayload() { return { idle: GUIDE_HUMAN_MANIFEST.pose.idle, talk: GUIDE_HUMAN_MANIFEST.pose.talk, blink: true, lookAtPlayer: true }; }
