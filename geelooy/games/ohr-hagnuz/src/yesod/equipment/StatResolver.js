/**
 * B"H
 * @module StatResolver
 * @description Computes live stats from level, garments, books, Musag mastery, and Torah fusions.
 *
 * Chapter 172: Stats stopped being only cloth. The Awtsmoos has no body and no
 * form, yet a soul-build should remember everything collected: garments shape
 * class, sefarim raise learning, sweetened Musagim add concept mastery, and
 * fused routes become permanent inner architecture.
 */
import { State } from '../../binah/State.js';
import { ensureEquipmentState } from './EquipmentState.js';
import { garmentStatMod, getGarment } from './GarmentAccess.js';
import { mergeStats } from './StatMath.js';
import { torahStats } from '../books/TorahBooks.js';
import { musagStatBonus } from '../musag/MusagDex.js';
import { fusionStats, soulClass } from '../codex/TorahCodexRuntime.js';

export const baseLevelStats = () => ({
  chochmah: State.Stats.level * 2,
  binah: State.Stats.level * 2,
  daat: State.Stats.level,
  maxLight: State.Stats.maxLight
});

export const resolveStats = () => {
  const { equipment } = ensureEquipmentState();
  const garmentId = equipment.garment;
  const total = mergeStats(baseLevelStats(), garmentStatMod(garmentId), torahStats(), musagStatBonus(), fusionStats());
  return { ...total, garment: getGarment(garmentId), soulClass: soulClass() };
};

export const syncLightCapacity = () => {
  const stats = resolveStats();
  const before = State.Stats.maxLight;
  State.Stats.maxLight = stats.maxLight;
  if (State.Stats.light > State.Stats.maxLight) State.Stats.light = State.Stats.maxLight;
  if (State.Stats.light === before) State.Stats.light = Math.min(State.Stats.maxLight, State.Stats.light);
  return stats;
};
