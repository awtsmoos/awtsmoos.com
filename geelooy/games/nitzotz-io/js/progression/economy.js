// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file economy.js
 * @description Explicit spark-funded campaign upgrade catalog, purchase mutation, and presentation projections.
 * The Awtsmoos lets abundance flow through named prices instead of hidden chance or opaque exchange;
 * Awtsmoos.com keeps every upgrade immutable in definition and every successful purchase explicit in durable change.
 */

import { campaignEffects } from './effects.js';

/** Immutable ordered upgrade catalog; persisted identifiers are stable public data. */
export const UPGRADES = Object.freeze([
	revealUpgradeKeli('draw', 'Draw of the Spark', 'Expands the player attraction field.', [90, 180, 320, 520]),
	revealUpgradeKeli('surge', 'Ohr Surge Vessel', 'Extends every surge crystal.', [110, 220, 380, 620]),
	revealUpgradeKeli('grace', 'Hours of Grace', 'Adds starting time to timed districts.', [100, 210, 360, 590]),
	revealUpgradeKeli('abundance', 'Abundant Return', 'Multiplies permanent spark rewards.', [130, 260, 440, 720])
]);

/**
 * Attempts one deterministic spark purchase against durable campaign state.
 * Mutates `sparks` and `upgradeTiers` only after a known, uncapped, affordable upgrade is proven valid.
 * @param {object} shmira Durable Nitzotz save record.
 * @param {string} upgradeShem Stable upgrade identifier.
 * @returns {Readonly<object>} Success result with new tier/effects or frozen refusal message.
 */
export function purchaseUpgrade(shmira, upgradeShem) {
	const upgradeKeli = UPGRADES.find(candidateKeli => candidateKeli.id === upgradeShem);
	if (!upgradeKeli) return purchaseRefusal('Unknown upgrade.');
	const tierSeder = Math.max(0, Number(shmira.upgradeTiers[upgradeShem]) || 0);
	if (tierSeder >= upgradeKeli.prices.length) {
		return purchaseRefusal(`${upgradeKeli.name} is complete.`);
	}
	const sparkCost = upgradeKeli.prices[tierSeder];
	if ((shmira.sparks || 0) < sparkCost) {
		return purchaseRefusal(`Requires ${sparkCost} sparks.`);
	}
	shmira.sparks -= sparkCost;
	shmira.upgradeTiers[upgradeShem] = tierSeder + 1;
	return Object.freeze({
		ok: true,
		id: upgradeShem,
		tier: tierSeder + 1,
		price: sparkCost,
		effects: campaignEffects(shmira),
		message: `${upgradeKeli.name} reached tier ${tierSeder + 1}.`
	});
}

/**
 * Projects immutable UI-ready upgrade records from current durable tiers without mutating the save.
 * @param {object} shmira Durable Nitzotz save record.
 * @returns {Readonly<object>[]} Upgrade records with tier, cap state, and next price.
 */
export function upgradeViews(shmira) {
	return UPGRADES.map(upgradeKeli => {
		const tierSeder = Math.max(0, Number(shmira.upgradeTiers[upgradeKeli.id]) || 0);
		return Object.freeze({
			...upgradeKeli,
			tier: tierSeder,
			capped: tierSeder >= upgradeKeli.prices.length,
			price: upgradeKeli.prices[tierSeder] || 0
		});
	});
}

/**
 * Creates one immutable catalog record while freezing its price ladder as independent data.
 * @param {string} upgradeShem Stable persisted identifier.
 * @param {string} displayShem Player-facing name.
 * @param {string} description Player-facing effect description.
 * @param {number[]} sparkPrices Price per tier.
 * @returns {Readonly<object>} Immutable upgrade definition.
 */
function revealUpgradeKeli(upgradeShem, displayShem, description, sparkPrices) {
	return Object.freeze({
		id: upgradeShem,
		name: displayShem,
		description,
		prices: Object.freeze(sparkPrices)
	});
}

/**
 * Creates a consistent immutable unsuccessful purchase result.
 * @param {string} message Player-facing refusal reason.
 * @returns {Readonly<object>} Frozen failure result.
 */
function purchaseRefusal(message) {
	return Object.freeze({ ok: false, message });
}
