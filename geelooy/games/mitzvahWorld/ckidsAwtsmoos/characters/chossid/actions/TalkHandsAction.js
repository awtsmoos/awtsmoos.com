// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const TalkHandsActionSpec = buildActionSpec("talkHands", 2.4, [
  { bone:"head", keys:[{ t:0, r:[0, 0, 0] }, { t:.8, r:[-.04, .08, 0] }, { t:1.6, r:[.03, -.06, 0] }, { t:2.4, r:[0, 0, 0] }] },
  { bone:"leftArm", keys:[{ t:0, r:[.25, 0, .42] }, { t:.8, r:[.75, -.18, .65] }, { t:1.6, r:[.35, .1, .35] }, { t:2.4, r:[.25, 0, .42] }] },
  { bone:"leftForeArm", keys:[{ t:0, r:[-.35, 0, 0] }, { t:.8, r:[-1.05, .05, 0] }, { t:1.6, r:[-.62, 0, 0] }, { t:2.4, r:[-.35, 0, 0] }] },
  { bone:"rightArm", keys:[{ t:0, r:[.3, 0, -.35] }, { t:.8, r:[.42, .12, -.45] }, { t:1.6, r:[.78, -.08, -.72] }, { t:2.4, r:[.3, 0, -.35] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-.3, 0, 0] }, { t:.8, r:[-.58, 0, 0] }, { t:1.6, r:[-1.1, -.05, 0] }, { t:2.4, r:[-.3, 0, 0] }] }
]);
export function createTalkHandsAction(THREE, bones) { return createChossidActionClip(THREE, TalkHandsActionSpec, bones); }
export default createTalkHandsAction;
