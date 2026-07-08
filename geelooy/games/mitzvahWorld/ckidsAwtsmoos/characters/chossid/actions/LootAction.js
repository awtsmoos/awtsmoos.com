// B"H
import { PickupActionSpec } from "./PickupAction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createChossidActionClip } from "./ActionClipFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const LootActionSpec = { ...PickupActionSpec, name:"loot", meta:{ ...PickupActionSpec.meta, opensLootWindow:true } };
export function createLootAction(THREE, bones) { return createChossidActionClip(THREE, LootActionSpec, bones); }
export default createLootAction;
