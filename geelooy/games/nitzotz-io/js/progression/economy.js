// B"H
// Boruch Hashem
// Blessed is He
import { campaignEffects } from './effects.js';

/** Awtsmoos.com makes every upgrade price explicit so abundance never becomes opacity. */
export const UPGRADES = Object.freeze([
	upgrade('draw', 'Draw of the Spark', 'Expands the player attraction field.', [90, 180, 320, 520]),
	upgrade('surge', 'Ohr Surge Vessel', 'Extends every surge crystal.', [110, 220, 380, 620]),
	upgrade('grace', 'Hours of Grace', 'Adds starting time to timed districts.', [100, 210, 360, 590]),
	upgrade('abundance', 'Abundant Return', 'Multiplies permanent spark rewards.', [130, 260, 440, 720])
]);

export function purchaseUpgrade(save, id) {
	const definition = UPGRADES.find(item => item.id === id);
	if (!definition) return failure('Unknown upgrade.');
	const tier = Math.max(0, Number(save.upgradeTiers[id]) || 0);
	if (tier >= definition.prices.length) return failure(`${definition.name} is complete.`);
	const price = definition.prices[tier];
	if ((save.sparks || 0) < price) return failure(`Requires ${price} sparks.`);
	save.sparks -= price;
	save.upgradeTiers[id] = tier + 1;
	return Object.freeze({ ok: true, id, tier: tier + 1, price, effects: campaignEffects(save), message: `${definition.name} reached tier ${tier + 1}.` });
}

export function upgradeViews(save) {
	return UPGRADES.map(definition => {
		const tier = Math.max(0, Number(save.upgradeTiers[definition.id]) || 0);
		return Object.freeze({ ...definition, tier, capped: tier >= definition.prices.length, price: definition.prices[tier] || 0 });
	});
}

function upgrade(id, name, description, prices) {
	return Object.freeze({ id, name, description, prices: Object.freeze(prices) });
}

function failure(message) {
	return Object.freeze({ ok: false, message });
}
