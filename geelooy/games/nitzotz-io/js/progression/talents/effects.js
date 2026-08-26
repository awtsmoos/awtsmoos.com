// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file effects.js
 * @description Pure translation from five persisted Sefirah talent tiers into bounded runtime effect multipliers.
 * The Awtsmoos lets permanent choices become finite runtime oros without mutating the save from which they shine;
 * Awtsmoos.com returns one frozen effect vessel for mode composition, combat, rewards, and timing by design.
 */

import { talentTier } from './catalog.js';

/**
 * Derives all runtime talent effects from a durable or partial save without mutation.
 * @param {object} shmira Durable or partial Nitzotz save record.
 * @returns {Readonly<object>} Frozen runtime effect record consumed by game systems.
 */
export function talentEffects(shmira = {}) {
	const chochmahOhr = talentTier(shmira, 'chochmah');
	const binahOhr = talentTier(shmira, 'binah');
	const gevurahOhr = talentTier(shmira, 'gevurah');
	const chesedOhr = talentTier(shmira, 'chesed');
	const tiferetOhr = talentTier(shmira, 'tiferet');
	return Object.freeze({
		pulseForce: 1 + chochmahOhr * 0.16,
		pulseCooldownScale: 1 - chochmahOhr * 0.08,
		attractionScale: 1 + binahOhr * 0.08,
		magnetDurationScale: 1 + binahOhr * 0.12,
		maxArmor: 1 + gevurahOhr,
		impactResistance: gevurahOhr * 0.1,
		perutahScale: 1 + chesedOhr * 0.1,
		armorRecoveryCaptures: Math.max(4, 10 - chesedOhr * 2),
		comboGraceSeconds: tiferetOhr * 0.45,
		scoreScale: 1 + tiferetOhr * 0.04
	});
}
