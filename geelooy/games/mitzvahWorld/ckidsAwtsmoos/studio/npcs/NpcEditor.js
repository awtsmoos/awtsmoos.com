// B"H
import { createNpc } from "../core/StudioState.js";
export function editNpc(npc = {}, patch = {}) { return createNpc({ ...npc, ...patch }); }
export default { editNpc };
