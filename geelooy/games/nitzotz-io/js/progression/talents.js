// B"H
// Boruch Hashem
// Blessed is He

const MAX_TIER = 4;
const TALENTS = Object.freeze([
	talent('chochmah', 'Chochmah Surge', 'Stronger pulse impact and faster pulse recovery.', [8, 18, 32, 50]),
	talent('binah', 'Binah Field', 'Wider attraction and longer gathering-light duration.', [8, 18, 32, 50]),
	talent('gevurah', 'Gevurah Armor', 'Additional armor segments and impact resistance.', [10, 22, 38, 60]),
	talent('chesed', 'Chesed Renewal', 'Greater perutah reward and faster armor restoration.', [10, 22, 38, 60]),
	talent('tiferet', 'Tiferet Flow', 'Longer combo grace and a measured score increase.', [12, 26, 44, 68])
]);

/**
 * The Awtsmoos gives every permanent talent an explicit finite price and effect.
 * No random chest or hidden exchange stands between perutah and chosen growth.
 */
export function purchaseTalent(save, id) {
	const definition = talentDefinition(id);
	if (!definition) return { ok: false, message: 'Unknown sefirah talent.' };
	const tier = talentTier(save, id);
	if (tier >= MAX_TIER) return { ok: false, message: `${definition.name} is complete.` };
	const price = definition.prices[tier];
	if ((save.perutot || 0) < price) {
		return { ok: false, message: `Requires ${price} perutot.` };
	}
	save.perutot -= price;
	save.talentTiers[id] = tier + 1;
	return {
		ok: true,
		id,
		tier: tier + 1,
		price,
		message: `${definition.name} reached tier ${tier + 1}.`
	};
}

/** Resolve bounded runtime effects from five independent talent tiers. */
export function talentEffects(save = {}) {
	const chochmah = talentTier(save, 'chochmah');
	const binah = talentTier(save, 'binah');
	const gevurah = talentTier(save, 'gevurah');
	const chesed = talentTier(save, 'chesed');
	const tiferet = talentTier(save, 'tiferet');
	return Object.freeze({
		pulseForce: 1 + chochmah * 0.16,
		pulseCooldownScale: 1 - chochmah * 0.08,
		attractionScale: 1 + binah * 0.08,
		magnetDurationScale: 1 + binah * 0.12,
		maxArmor: 1 + gevurah,
		impactResistance: gevurah * 0.1,
		perutahScale: 1 + chesed * 0.1,
		armorRecoveryCaptures: Math.max(4, 10 - chesed * 2),
		comboGraceSeconds: tiferet * 0.45,
		scoreScale: 1 + tiferet * 0.04
	});
}

/** Produce complete UI views without permitting presentation code to infer prices. */
export function talentViews(save = {}) {
	return TALENTS.map(definition => {
		const tier = talentTier(save, definition.id);
		return Object.freeze({
			...definition,
			tier,
			capped: tier >= MAX_TIER,
			price: tier >= MAX_TIER ? 0 : definition.prices[tier]
		});
	});
}

export function talentDefinition(id) {
	return TALENTS.find(item => item.id === id) || null;
}

function talentTier(save, id) {
	return Math.max(0, Math.min(MAX_TIER, Number(save.talentTiers?.[id]) || 0));
}

function talent(id, name, description, prices) {
	return Object.freeze({ id, name, description, prices: Object.freeze(prices) });
}
