// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const GiveItemActionSpec = buildActionSpec("giveItem", 1.4, [
  { bone:"spine2", keys:[{ t:0, r:[0, 0, 0] }, { t:.65, r:[.08, 0, 0] }, { t:1.4, r:[0, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[.25, 0, .35] }, { t:.65, r:[.9, .05, .25] }, { t:1.4, r:[.25, 0, .35] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.25, 0, -.35] }, { t:.65, r:[.9, -.05, -.25] }, { t:1.4, r:[.25, 0, -.35] }] },
  { bone:"leftForeArm", keys:[{ t:0, r:[-.45, 0, 0] }, { t:.65, r:[-.2, 0, 0] }, { t:1.4, r:[-.45, 0, 0] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-.45, 0, 0] }, { t:.65, r:[-.2, 0, 0] }, { t:1.4, r:[-.45, 0, 0] }] }
]);
export function createGiveItemAction(THREE, bones) { return createChossidActionClip(THREE, GiveItemActionSpec, bones); }
export default createGiveItemAction;
