// B"H
/**
 * @file levelGuideMarkerPass.js
 * @description Chapter 261: The central marker is now composed from three tiny
 * vessels: pedestal, prompt, and ring.
 */
import { GUIDE_MARKER } from './guideMarkerConfig.js';
import { addGuidePedestal } from './guideMarkerPedestal.js';
import { addGuidePrompt } from './guideMarkerPrompt.js';
import { addGuideRing } from './guideMarkerRing.js';
export function addLevelGuideMarker(n) {
  addGuidePedestal(n, GUIDE_MARKER);
  addGuidePrompt(n, GUIDE_MARKER);
  addGuideRing(n, GUIDE_MARKER);
}
