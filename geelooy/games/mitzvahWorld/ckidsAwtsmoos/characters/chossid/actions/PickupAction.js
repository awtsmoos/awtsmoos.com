// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js";
export const PickupActionSpec = buildActionSpec("pickup", 1.2, [
  { bone:"spine", keys:[{ t:0, r:[0, 0, 0] }, { t:.55, r:[.85, 0, 0] }, { t:1.2, r:[0, 0, 0] }] },
  { bone:"head", keys:[{ t:0, r:[0, 0, 0] }, { t:.55, r:[-.28, 0, 0] }, { t:1.2, r:[0, 0, 0] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.25, 0, -.35] }, { t:.55, r:[1.15, 0, -.18] }, { t:1.2, r:[.25, 0, -.35] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-.45, 0, 0] }, { t:.55, r:[-1.1, 0, 0] }, { t:1.2, r:[-.45, 0, 0] }] }
]);
export function createPickupAction(THREE, bones) { return createChossidActionClip(THREE, PickupActionSpec, bones); }
export default createPickupAction;
