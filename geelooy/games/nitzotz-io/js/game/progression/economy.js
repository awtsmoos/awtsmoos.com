// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file economy.js
 * @description Adapts pure progression purchases and claims into durable world-state consequences.
 * The Awtsmoos lets every chosen acquisition return a clear nitzotz of success or refusal;
 * Awtsmoos.com persists only successful change, then renews the arena so purchased effects become visible in full.
 */

import { purchaseUpgrade } from '../../progression/economy.js';
import { claimQuest } from '../../progression/quests.js';
import { purchaseTalent } from '../../progression/talents.js';
import { saveGame } from '../../save.js';
import { resetToLevel } from '../reset.js';

/**
 * Attempts a spark-funded upgrade and, on success, persists and rebuilds the current ready arena.
 * @param {object} olam Mutable Nitzotz world state.
 * @param {string} upgradeId Stable upgrade catalog identifier.
 * @returns {object} Purchase result returned by the progression economy.
 */
export function buyUpgrade(olam, upgradeId) {
	return completePurchase(olam, purchaseUpgrade(olam.save, upgradeId));
}

/**
 * Attempts a perutah-funded talent and applies the same successful-purchase persistence covenant as upgrades.
 * @param {object} olam Mutable Nitzotz world state.
 * @param {string} sefirahId Stable talent identifier.
 * @returns {object} Talent purchase result.
 */
export function buyTalent(olam, sefirahId) {
	return completePurchase(olam, purchaseTalent(olam.save, sefirahId));
}

/**
 * Claims one completed campaign quest, always surfaces its message, and persists only a successful claim.
 * @param {object} olam Mutable Nitzotz world state.
 * @param {string} questId Stable quest identifier.
 * @returns {object} Claim result including `ok` and message fields.
 */
export function claimCampaignQuest(olam, questId) {
	const claimNitzotz = claimQuest(olam.save, questId);
	olam.message = claimNitzotz.message;
	if (claimNitzotz.ok) saveGame(olam.save);
	return claimNitzotz;
}

/**
 * Finalizes a successful purchase while leaving a failed purchase free of persistence or arena regeneration.
 * @param {object} olam Mutable Nitzotz world state.
 * @param {object} purchaseNitzotz Purchase result produced by a lower progression domain.
 * @returns {object} The original purchase result, preserving public API identity.
 */
function completePurchase(olam, purchaseNitzotz) {
	olam.message = purchaseNitzotz.message;
	if (!purchaseNitzotz.ok) return purchaseNitzotz;
	saveGame(olam.save);
	resetToLevel(olam, olam.level.index, 'ready', purchaseNitzotz.message);
	return purchaseNitzotz;
}
