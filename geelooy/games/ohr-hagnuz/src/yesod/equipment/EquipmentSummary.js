/**
 * B"H
 * @module EquipmentSummary
 * Small text for test console and HUD.
 */
import { ensureEquipmentState } from './EquipmentState.js';
import { resolveStats } from './StatResolver.js';

export const equipmentSummary = () => {
  const { inventory } = ensureEquipmentState();
  const stats = resolveStats();
  return {
    equipped: stats.garment?.id || null,
    garment: stats.garment?.name || 'None',
    icon: stats.garment?.icon || '○',
    stats: { chochmah: stats.chochmah, binah: stats.binah, daat: stats.daat, maxLight: stats.maxLight },
    inventory: inventory.garments.slice()
  };
};

export const equipmentLine = () => {
  const sum = equipmentSummary();
  return `Garment: ${sum.icon} ${sum.garment} | Ch: ${sum.stats.chochmah} Bi: ${sum.stats.binah} Da: ${sum.stats.daat}`;
};
