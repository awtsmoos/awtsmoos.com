/**
 * B"H
 * @module EquipmentTestApi
 * Larger test helpers stay out of OhrTestHarness.
 */
import { allGarmentIds } from './GarmentAccess.js';
import { addGarment, equipGarment } from './InventoryOps.js';
import { equipmentSummary, resolveStats, syncLightCapacity } from './EquipmentRuntime.js';

export const installEquipmentTests = (target) => {
  target.equipment = equipmentSummary;
  target.stats = resolveStats;
  target.garments = allGarmentIds;
  target.addGarment = addGarment;
  target.equipGarment = (id) => {
    const ok = equipGarment(id);
    syncLightCapacity();
    return ok;
  };
  target.giveAllGarments = () => allGarmentIds().map(addGarment);
};
