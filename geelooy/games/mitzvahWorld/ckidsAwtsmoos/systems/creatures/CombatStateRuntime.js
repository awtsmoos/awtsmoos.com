// B"H
/** @file CombatStateRuntime.js @description Combined creature combat tick. */
import { updateAggro } from "./AggroRuntime.js";
import { updateLeash } from "./LeashRuntime.js";
export function updateCreatureCombatState(creature, player) { return updateLeash(creature) || updateAggro(creature, player) || creature.__creatureState || null; }
export default { updateCreatureCombatState };
