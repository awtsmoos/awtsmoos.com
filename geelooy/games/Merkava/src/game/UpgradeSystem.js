//B"H
// Boruch Hashem
// Blessed is He
/**
 * Spending becomes sacrifice: power now is weighed against treasure preserved.
 * The Awtsmoos gives every choice its moment while Awtsmoos.com reveals its result.
 */
import { RUN_UPGRADES } from '../config/economyConfig.js';
import { shopPrice } from './GameRules.js';

export class UpgradeSystem {
	offers(state) {
		const start = (state.worldIndex * 3 + state.levelIndex + totalPurchases(state)) % RUN_UPGRADES.length;
		return [0, 1, 2].map(offset => this.describe(state, RUN_UPGRADES[(start + offset) % RUN_UPGRADES.length]));
	}

	describe(state, definition) {
		const level = state.upgrades[definition.id] || 0;
		return {
			...definition,
			level,
			price: shopPrice(definition.basePrice, level, state.worldIndex),
			disabled: level >= definition.maximum
		};
	}

	purchase(state, upgradeId) {
		const definition = RUN_UPGRADES.find(item => item.id === upgradeId);
		if (!definition) {
			return { ok: false, reason: 'Unknown upgrade.' };
		}
		const offer = this.describe(state, definition);
		if (offer.disabled || state.prutahs < offer.price) {
			return { ok: false, reason: offer.disabled ? 'Maximum level.' : 'Not enough Prutahs.' };
		}
		state.prutahs -= offer.price;
		state.upgrades[upgradeId] = offer.level + 1;
		this.apply(state, upgradeId);
		state.pushEvent('upgrade', { id: upgradeId, level: offer.level + 1, price: offer.price });
		return { ok: true, offer };
	}

	apply(state, id) {
		if (id === 'sparks') {
			state.troops = Math.min(250, state.troops + 6);
		} else if (id === 'damage') {
			state.damageMultiplier *= 1.22;
		} else if (id === 'fireRate') {
			state.fireRateMultiplier *= 1.16;
		} else if (id === 'sideShots') {
			state.sideShots += 1;
		} else if (id === 'piercing') {
			state.piercing += 1;
		} else if (id === 'shield') {
			state.shield += 2;
			state.maxShield += 2;
		} else if (id === 'magnet') {
			state.magnetRadius += 0.75;
		} else if (id === 'prutahValue') {
			state.prutahValueMultiplier *= 1.2;
		} else if (id === 'positiveGate') {
			state.positiveGateBoost += 0.18;
		}
	}
}

function totalPurchases(state) {
	return Object.values(state.upgrades).reduce((sum, level) => sum + level, 0);
}
