// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js";
export const BowShootActionSpec = buildActionSpec("bowShoot", 1.25, [
  { bone:"spine2", keys:[{ t:0, r:[.04, .1, 0] }, { t:.55, r:[.08, .18, 0] }, { t:1.25, r:[0, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[.75, .15, .65] }, { t:.55, r:[1.2, .1, .45] }, { t:1.25, r:[.25, 0, .35] }] },
  { bone:"leftForeArm", keys:[{ t:0, r:[-.15, 0, 0] }, { t:.55, r:[-.1, 0, 0] }, { t:1.25, r:[-.45, 0, 0] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.75, -.3, -.65] }, { t:.55, r:[.82, -.8, -.9] }, { t:.78, r:[.55, -.15, -.35] }, { t:1.25, r:[.25, 0, -.35] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-1.1, 0, 0] }, { t:.55, r:[-1.45, 0, 0] }, { t:.78, r:[-.6, 0, 0] }, { t:1.25, r:[-.45, 0, 0] }] }
], [], { weapon:"bow" });
export function createBowShootAction(THREE, bones) { return createChossidActionClip(THREE, BowShootActionSpec, bones); }
export default createBowShootAction;
