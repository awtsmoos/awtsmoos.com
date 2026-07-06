// B"H
import { buildActionSpec, createChossidActionClip } from "./ActionClipFactory.js";
export const OpenDoorActionSpec = buildActionSpec("openDoor", 1, [
  { bone:"rightArm", keys:[{ t:0, r:[.25, 0, -.35] }, { t:.45, r:[.85, -.25, -.45] }, { t:.72, r:[.75, -.45, -.2] }, { t:1, r:[.25, 0, -.35] }] },
  { bone:"rightForeArm", keys:[{ t:0, r:[-.5, 0, 0] }, { t:.45, r:[-.8, 0, 0] }, { t:.72, r:[-.65, .15, 0] }, { t:1, r:[-.5, 0, 0] }] },
  { bone:"spine2", keys:[{ t:0, r:[0, 0, 0] }, { t:.55, r:[.05, -.15, 0] }, { t:1, r:[0, 0, 0] }] }
]);
export function createOpenDoorAction(THREE, bones) { return createChossidActionClip(THREE, OpenDoorActionSpec, bones); }
export default createOpenDoorAction;
