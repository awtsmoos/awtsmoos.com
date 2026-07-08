// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const RunActionSpec = buildActionSpec("run", .72, [
  { bone:"spine", keys:[{ t:0, r:[.12, 0, 0] }, { t:.36, r:[.18, 0, 0] }, { t:.72, r:[.12, 0, 0] }] },
  { bone:"leftUpLeg", keys:[{ t:0, r:[.82, 0, 0] }, { t:.36, r:[-.72, 0, 0] }, { t:.72, r:[.82, 0, 0] }] },
  { bone:"rightUpLeg", keys:[{ t:0, r:[-.72, 0, 0] }, { t:.36, r:[.82, 0, 0] }, { t:.72, r:[-.72, 0, 0] }] },
  { bone:"leftLeg", keys:[{ t:0, r:[-.55, 0, 0] }, { t:.36, r:[.82, 0, 0] }, { t:.72, r:[-.55, 0, 0] }] },
  { bone:"rightLeg", keys:[{ t:0, r:[.82, 0, 0] }, { t:.36, r:[-.55, 0, 0] }, { t:.72, r:[.82, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[-.65, 0, .22] }, { t:.36, r:[.68, 0, .18] }, { t:.72, r:[-.65, 0, .22] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.68, 0, -.18] }, { t:.36, r:[-.65, 0, -.22] }, { t:.72, r:[.68, 0, -.18] }] }
], [
  { bone:"hips", keys:[{ t:0, p:[0, 0, 0] }, { t:.18, p:[0, .07, 0] }, { t:.36, p:[0, 0, 0] }, { t:.54, p:[0, .07, 0] }, { t:.72, p:[0, 0, 0] }] }
]);
export function createRunAction(THREE, bones) { return createChossidActionClip(THREE, RunActionSpec, bones); }
export default createRunAction;
