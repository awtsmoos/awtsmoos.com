/**
 * B"H
 * @module InventoryOps
 * Small mutations for garment collection and equipping.
 */
import { State } from '../../binah/State.js';
import { ensureEquipmentState } from './EquipmentState.js';
import { getGarment } from './GarmentAccess.js';
import { syncLightCapacity } from './StatResolver.js';

export const hasGarment = (id) => {
  const { inventory } = ensureEquipmentState();
  return inventory.garments.includes(id);
};

export const addGarment = (id) => {
  const garment = getGarment(id);
  if (!garment) return false;
  const { inventory } = ensureEquipmentState();
  if (!inventory.garments.includes(id)) inventory.garments.push(id);
  syncLightCapacity();
  State.say(`Garment gained: ${garment.icon} ${garment.name}`, 360);
  return true;
};

export const equipGarment = (id) => {
  const garment = getGarment(id);
  if (!garment || !hasGarment(id)) return false;
  const { equipment } = ensureEquipmentState();
  equipment.garment = id;
  syncLightCapacity();
  State.say(`Equipped: ${garment.icon} ${garment.name}`, 360);
  return true;
};
