// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const AcceptQuestActionSpec = buildActionSpec("acceptQuest", 1.35, [
  { bone:"head", keys:[{ t:0, r:[0, 0, 0] }, { t:.45, r:[.16, 0, 0] }, { t:.9, r:[-.08, 0, 0] }, { t:1.35, r:[0, 0, 0] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.25, 0, -.35] }, { t:.7, r:[.85, -.2, -.32] }, { t:1.35, r:[.25, 0, -.35] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-.45, 0, 0] }, { t:.7, r:[-.95, 0, 0] }, { t:1.35, r:[-.45, 0, 0] }] }
]);
export function createAcceptQuestAction(THREE, bones) { return createChossidActionClip(THREE, AcceptQuestActionSpec, bones); }
export default createAcceptQuestAction;
