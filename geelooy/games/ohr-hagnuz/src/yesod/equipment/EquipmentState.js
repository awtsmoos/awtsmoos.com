/**
 * B"H
 * @module EquipmentState
 * Guards State.Equipment and State.Inventory without bloating State.js.
 */
import { State } from '../../binah/State.js';
import { baseEquipment, baseInventory, baseSefiros } from './EquipmentDefaults.js';

export const ensureEquipmentState = () => {
  State.Sefiros ||= baseSefiros();
  State.Equipment ||= baseEquipment();
  State.Inventory ||= baseInventory();
  State.Inventory.garments ||= baseInventory().garments;
  return { equipment: State.Equipment, inventory: State.Inventory, sefiros: State.Sefiros };
};
