// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const PunchActionSpec = buildActionSpec("punch", .85, [
  { bone:"spine2", keys:[{ t:0, r:[0, 0, 0] }, { t:.28, r:[.08, -.22, 0] }, { t:.5, r:[.04, .18, 0] }, { t:.85, r:[0, 0, 0] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.45, 0, -.35] }, { t:.28, r:[.95, -.35, -.2] }, { t:.5, r:[1.25, -.2, -.05] }, { t:.85, r:[.45, 0, -.35] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-1.1, 0, 0] }, { t:.28, r:[-.45, 0, 0] }, { t:.5, r:[-.08, 0, 0] }, { t:.85, r:[-1.1, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[.4, 0, .35] }, { t:.5, r:[.58, .1, .45] }, { t:.85, r:[.4, 0, .35] }] }
]);
export function createPunchAction(THREE, bones) { return createChossidActionClip(THREE, PunchActionSpec, bones); }
export default createPunchAction;
