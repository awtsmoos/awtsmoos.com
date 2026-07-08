// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const WaveActionSpec = buildActionSpec("wave", 1.8, [
  { bone:"rightArm", keys:[{ t:0, r:[.25, 0, -.35] }, { t:.35, r:[1.5, -.1, -.95] }, { t:1.45, r:[1.5, -.1, -.95] }, { t:1.8, r:[.25, 0, -.35] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-.45, 0, 0] }, { t:.35, r:[-1.05, 0, 0] }, { t:.75, r:[-.75, 0, .45] }, { t:1.1, r:[-1.2, 0, -.45] }, { t:1.45, r:[-.75, 0, .45] }, { t:1.8, r:[-.45, 0, 0] }] },
  { bone:"head", keys:[{ t:0, r:[0, 0, 0] }, { t:.8, r:[-.04, .08, 0] }, { t:1.8, r:[0, 0, 0] }] }
]);
export function createWaveAction(THREE, bones) { return createChossidActionClip(THREE, WaveActionSpec, bones); }
export default createWaveAction;
