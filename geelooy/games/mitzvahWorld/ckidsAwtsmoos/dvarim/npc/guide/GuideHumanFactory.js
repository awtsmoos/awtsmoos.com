// B"H
/**
 * @file GuideHumanFactory.js
 * @description Chapter 472: A small factory creates metadata for a real
 * procedural-core guide whose face, garments, and motion can be upgraded by the
 * renderer without changing the village manifest.
 */
import { guideAnimationPayload } from './GuideIdleAnimation.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { guideClothingPayload } from './GuideClothing.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { guideFaceRigPayload } from './GuideFaceRig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { GUIDE_HUMAN_MANIFEST } from './GuideHumanManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function createGuideHumanPayload() {
  return { kind: 'procedural-core-human', id: GUIDE_HUMAN_MANIFEST.id, human: GUIDE_HUMAN_MANIFEST.human, face: guideFaceRigPayload(), clothing: guideClothingPayload(), animation: guideAnimationPayload() };
}
