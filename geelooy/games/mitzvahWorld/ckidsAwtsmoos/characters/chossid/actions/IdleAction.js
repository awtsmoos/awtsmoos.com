// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const IdleActionSpec = buildActionSpec("idle", 2, [
  { bone:"spine2", keys:[{ t:0, r:[0, 0, 0] }, { t:1, r:[.035, 0, 0] }, { t:2, r:[0, 0, 0] }] },
  { bone:"head", keys:[{ t:0, r:[0, 0, 0] }, { t:1, r:[-.025, .03, 0] }, { t:2, r:[0, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[.08, 0, .18] }, { t:1, r:[.11, 0, .16] }, { t:2, r:[.08, 0, .18] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.08, 0, -.18] }, { t:1, r:[.11, 0, -.16] }, { t:2, r:[.08, 0, -.18] }] }
]);
export function createIdleAction(THREE, bones) { return createChossidActionClip(THREE, IdleActionSpec, bones); }
export default createIdleAction;
