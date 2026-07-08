// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const CastActionSpec = buildActionSpec("cast", 1.4, [
  { bone:"spine2", keys:[{ t:0, r:[0, 0, 0] }, { t:.65, r:[.1, 0, 0] }, { t:1.4, r:[0, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[.22, 0, .4] }, { t:.65, r:[1.05, .15, .65] }, { t:1.4, r:[.22, 0, .4] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.22, 0, -.4] }, { t:.65, r:[1.05, -.15, -.65] }, { t:1.4, r:[.22, 0, -.4] }] },
  { bone:"leftForeArm", keys:[{ t:0, r:[-.45, 0, 0] }, { t:.65, r:[-.2, 0, 0] }, { t:1.4, r:[-.45, 0, 0] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-.45, 0, 0] }, { t:.65, r:[-.2, 0, 0] }, { t:1.4, r:[-.45, 0, 0] }] }
], [], { effect:"spark" });
export function createCastAction(THREE, bones) { return createChossidActionClip(THREE, CastActionSpec, bones); }
export default createCastAction;
