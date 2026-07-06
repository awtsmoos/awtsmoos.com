// B"H
import { PickupActionSpec } from "./PickupAction.js";
import { createChossidActionClip } from "./ActionClipFactory.js";
export const LootActionSpec = { ...PickupActionSpec, name:"loot", meta:{ ...PickupActionSpec.meta, opensLootWindow:true } };
export function createLootAction(THREE, bones) { return createChossidActionClip(THREE, LootActionSpec, bones); }
export default createLootAction;
