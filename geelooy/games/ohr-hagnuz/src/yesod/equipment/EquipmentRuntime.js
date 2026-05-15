/**
 * B"H
 * @module EquipmentRuntime
 * One tiny barrel for convenient imports.
 */
export { ensureEquipmentState } from './EquipmentState.js';
export { addGarment, equipGarment, hasGarment } from './InventoryOps.js';
export { resolveStats, syncLightCapacity } from './StatResolver.js';
export { equipmentSummary, equipmentLine } from './EquipmentSummary.js';
export { computeDebateDamage, computeDefenseLoss, computeHeal } from './DebateGarmentEffects.js';
export { garmentRewardForQuest, garmentRewardForDebateMilestone } from './GarmentRewards.js';
