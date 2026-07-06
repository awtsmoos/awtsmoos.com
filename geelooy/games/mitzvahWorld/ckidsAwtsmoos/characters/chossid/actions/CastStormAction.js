// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js";
export const CastStormActionSpec = buildActionSpec("castStorm", 2.2, [
  { bone:"hips", keys:[{ t:0, r:[0, 0, 0] }, { t:1.1, r:[0, .35, 0] }, { t:2.2, r:[0, 0, 0] }] },
  { bone:"spine2", keys:[{ t:0, r:[0, 0, 0] }, { t:.9, r:[.18, 0, 0] }, { t:1.4, r:[.12, -.25, 0] }, { t:2.2, r:[0, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[.2, 0, .35] }, { t:.8, r:[1.55, .25, .9] }, { t:1.4, r:[1.35, -.2, .7] }, { t:2.2, r:[.2, 0, .35] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.2, 0, -.35] }, { t:.8, r:[1.55, -.25, -.9] }, { t:1.4, r:[1.35, .2, -.7] }, { t:2.2, r:[.2, 0, -.35] }] },
  { bone:"head", keys:[{ t:0, r:[0, 0, 0] }, { t:1.1, r:[-.15, 0, 0] }, { t:2.2, r:[0, 0, 0] }] }
], [], { effect:"storm" });
export function createCastStormAction(THREE, bones) { return createChossidActionClip(THREE, CastStormActionSpec, bones); }
export default createCastStormAction;
