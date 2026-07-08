// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const MeleeSlashActionSpec = buildActionSpec("meleeSlash", 1.05, [
  { bone:"hips", keys:[{ t:0, r:[0, -.28, 0] }, { t:.45, r:[0, .35, 0] }, { t:1.05, r:[0, 0, 0] }] },
  { bone:"spine2", keys:[{ t:0, r:[.08, -.25, 0] }, { t:.45, r:[.12, .42, 0] }, { t:1.05, r:[0, 0, 0] }] },
  { bone:"rightArm", keys:[{ t:0, r:[1.2, -.6, -.75] }, { t:.45, r:[.7, .55, -.2] }, { t:1.05, r:[.25, 0, -.35] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-.55, 0, 0] }, { t:.45, r:[-.2, 0, 0] }, { t:1.05, r:[-.6, 0, 0] }] }
], [], { weapon:"melee" });
export function createMeleeSlashAction(THREE, bones) { return createChossidActionClip(THREE, MeleeSlashActionSpec, bones); }
export default createMeleeSlashAction;
