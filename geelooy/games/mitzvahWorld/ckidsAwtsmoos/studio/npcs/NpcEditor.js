// B"H
import { createNpc } from "../core/StudioState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function editNpc(npc = {}, patch = {}) { return createNpc({ ...npc, ...patch }); }
export default { editNpc };
