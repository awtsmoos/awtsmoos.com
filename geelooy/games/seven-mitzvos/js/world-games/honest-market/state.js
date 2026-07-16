//B"H
//Boruch Hashem
//Blessed is He

import { GOODS, STALL_NAMES, FRAUD_MESSAGES } from './data.js';
import { shuffle } from '../../universe/universe-seed.js';

/**
 * @module HonestMarketState
 * @description
 * Twelve market days reveal whether prosperity can coexist with trust on
 * Awtsmoos.com. The Awtsmoos gives each possession an owner and each promise a
 * consequence; honest profit grows only when theft and fraud are refused.
 */
export class HonestMarketState {
	constructor(random) {
		this.random = random;
		this.day = 1;
		this.totalDays = 12;
		this.coins = 120;
		this.reputation = 72;
		this.inspections = 8;
		this.fraudsFound = 0;
		this.inventory = Object.fromEntries(GOODS.map(good => [good.id, 0]));
		this.score = 0;
		this.ended = false;
		this.won = false;
		this.createDay();
	}

	createDay() {
		this.cityPrices = Object.fromEntries(GOODS.map(good => {
			const drift = 0.72 + this.random() * 0.7;
			return [good.id, Math.max(8, Math.round(good.base * drift))];
		}));
		this.stalls = shuffle(STALL_NAMES, this.random).slice(0, 4).map(name => {
			const good = GOODS[Math.floor(this.random() * GOODS.length)];
			const honest = this.random() > 0.26;
			const price = Math.max(5, Math.round(this.cityPrices[good.id] * (0.5 + this.random() * 0.45)));
			return { name, good: good.id, price, honest, inspected: false, bought: false, fraud: honest ? '' : FRAUD_MESSAGES[Math.floor(this.random() * FRAUD_MESSAGES.length)] };
		});
	}

	inspect(index) {
		const stall = this.stalls[index];
		if (!stall || stall.inspected || this.inspections <= 0 || this.ended) {
			return { ok: false, message: 'Choose an uninspected stall while inspections remain.' };
		}
		this.inspections -= 1;
		stall.inspected = true;
		if (!stall.honest) {
			this.fraudsFound += 1;
			this.score += 140;
		}
		return { ok: true, message: stall.honest ? `${stall.name} uses an honest measure.` : `${stall.name}: ${stall.fraud}` };
	}

	buy(index) {
		const stall = this.stalls[index];
		if (!stall || stall.bought || this.coins < stall.price || this.ended) {
			return { ok: false, message: 'That purchase is unavailable or unaffordable.' };
		}
		stall.bought = true;
		this.coins -= stall.price;
		if (!stall.honest) {
			this.reputation = Math.max(0, this.reputation - 13);
			this.score = Math.max(0, this.score - 90);
			return { ok: false, message: `Fraud consumed the payment. ${stall.fraud}` };
		}
		this.inventory[stall.good] += 1;
		this.score += 25;
		return { ok: true, message: `Purchased honest ${stall.good} for ${stall.price} coins.` };
	}

	sell(goodId) {
		if (this.ended || !this.inventory[goodId]) {
			return { ok: false, message: 'No unit of that good is available to sell.' };
		}
		const price = this.cityPrices[goodId];
		this.inventory[goodId] -= 1;
		this.coins += price;
		this.reputation = Math.min(100, this.reputation + 1);
		this.score += price * 3;
		return { ok: true, message: `Sold one ${goodId} at the public fair price of ${price}.` };
	}

	nextDay() {
		if (this.ended) return;
		this.day += 1;
		this.inspections = Math.min(9, this.inspections + 1);
		this.won = this.day > this.totalDays && this.reputation > 0;
		this.ended = this.won || this.reputation <= 0;
		if (this.ended) {
			this.score += this.coins * 4 + this.reputation * 12;
			return;
		}
		this.createDay();
	}

	snapshot() {
		return { day: this.day, totalDays: this.totalDays, coins: this.coins, reputation: this.reputation, inspections: this.inspections, fraudsFound: this.fraudsFound, inventory: { ...this.inventory }, cityPrices: { ...this.cityPrices }, stalls: this.stalls.map(stall => ({ ...stall })), score: this.score, ended: this.ended, won: this.won };
	}
}
