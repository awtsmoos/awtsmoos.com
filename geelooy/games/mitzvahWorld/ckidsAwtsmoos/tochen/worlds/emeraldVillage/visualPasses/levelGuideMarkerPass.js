// B"H
/**
 * @file levelGuideMarkerPass.js
 * @description Chapter 261: The central marker is now composed from three tiny
 * vessels: pedestal, prompt, and ring.
 */
import { GUIDE_MARKER } from './guideMarkerConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addGuidePedestal } from './guideMarkerPedestal.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addGuidePrompt } from './guideMarkerPrompt.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addGuideRing } from './guideMarkerRing.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addLevelGuideMarker(n) {
  addGuidePedestal(n, GUIDE_MARKER);
  addGuidePrompt(n, GUIDE_MARKER);
  addGuideRing(n, GUIDE_MARKER);
}
