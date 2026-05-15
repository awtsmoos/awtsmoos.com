/**
 * B"H
 * @module StatResolver
 * Computes live chochmah/binah/daat/light from State + garments.
 */
import { State } from '../../binah/State.js';
import { ensureEquipmentState } from './EquipmentState.js';
import { garmentStatMod, getGarment } from './GarmentAccess.js';
import { mergeStats } from './StatMath.js';
import { torahStats } from '../books/TorahBooks.js';

export const baseLevelStats = () => ({
  chochmah: State.Stats.level * 2,
  binah: State.Stats.level * 2,
  daat: State.Stats.level,
  maxLight: State.Stats.maxLight
});

export const resolveStats = () => {
  const { equipment } = ensureEquipmentState();
  const garmentId = equipment.garment;
  const total = mergeStats(baseLevelStats(), garmentStatMod(garmentId), torahStats());
  return { ...total, garment: getGarment(garmentId) };
};

export const syncLightCapacity = () => {
  const stats = resolveStats();
  const before = State.Stats.maxLight;
  State.Stats.maxLight = stats.maxLight;
  if (State.Stats.light > State.Stats.maxLight) State.Stats.light = State.Stats.maxLight;
  if (State.Stats.light === before) {State.Stats.light = Math.min(State.Stats.maxLight, State.Stats.light);}
  return stats;
};
