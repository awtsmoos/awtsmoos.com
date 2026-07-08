// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const WalkActionSpec = buildActionSpec("walk", 1, [
  { bone:"hips", keys:[{ t:0, r:[0, 0, 0] }, { t:.5, r:[0, .04, 0] }, { t:1, r:[0, 0, 0] }] },
  { bone:"leftUpLeg", keys:[{ t:0, r:[.48, 0, 0] }, { t:.5, r:[-.42, 0, 0] }, { t:1, r:[.48, 0, 0] }] },
  { bone:"rightUpLeg", keys:[{ t:0, r:[-.42, 0, 0] }, { t:.5, r:[.48, 0, 0] }, { t:1, r:[-.42, 0, 0] }] },
  { bone:"leftLeg", keys:[{ t:0, r:[-.25, 0, 0] }, { t:.5, r:[.42, 0, 0] }, { t:1, r:[-.25, 0, 0] }] },
  { bone:"rightLeg", keys:[{ t:0, r:[.42, 0, 0] }, { t:.5, r:[-.25, 0, 0] }, { t:1, r:[.42, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[-.28, 0, .15] }, { t:.5, r:[.28, 0, .18] }, { t:1, r:[-.28, 0, .15] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.28, 0, -.15] }, { t:.5, r:[-.28, 0, -.18] }, { t:1, r:[.28, 0, -.15] }] }
], [
  { bone:"hips", keys:[{ t:0, p:[0, 0, 0] }, { t:.5, p:[0, .035, 0] }, { t:1, p:[0, 0, 0] }] }
]);
export function createWalkAction(THREE, bones) { return createChossidActionClip(THREE, WalkActionSpec, bones); }
export default createWalkAction;
