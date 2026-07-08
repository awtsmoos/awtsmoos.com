// B"H
/** @file CombatStateRuntime.js @description Combined creature combat tick. */
import { updateAggro } from "./AggroRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { updateLeash } from "./LeashRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function updateCreatureCombatState(creature, player) { return updateLeash(creature) || updateAggro(creature, player) || creature.__creatureState || null; }
export default { updateCreatureCombatState };
