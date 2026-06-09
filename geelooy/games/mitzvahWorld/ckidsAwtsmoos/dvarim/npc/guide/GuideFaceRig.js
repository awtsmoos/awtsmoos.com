// B"H
/**
 * @file GuideFaceRig.js
 * @description Chapter 431: Face rig metadata points the NPC renderer toward
 * living eyes, blink behavior, and beard attachments.
 */
import { GUIDE_HUMAN_MANIFEST } from './GuideHumanManifest.js';
export function guideFaceRigPayload() {
  return { eyes: GUIDE_HUMAN_MANIFEST.eyes, yarmulke: GUIDE_HUMAN_MANIFEST.yarmulke, beard: GUIDE_HUMAN_MANIFEST.beard, expression: 'warm_guidance' };
}
