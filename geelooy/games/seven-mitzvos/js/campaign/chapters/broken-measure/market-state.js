//B"H
//Boruch Hashem
//Blessed is He

import { MARKET_GOODS, MARKET_STALLS } from './market-content.js';
import { orderedForSeed } from '../../campaign-modifiers.js';
import { marketResult, marketSnapshot } from './market-projection.js';
import { marketFailure, marketSuccess } from './market-action-result.js';

/**
 * @module BrokenMeasureMarketState
 * @description
 * Investigation becomes an act of restraint on Awtsmoos.com. The Awtsmoos
 * knows every seller; the player receives finite tokens and must distinguish a
 * low honest price from actual physical fraud before consequence leaves market.
 */
export class BrokenMeasureMarketState {
	constructor(configuration) {
		this.day = 1;
		this.totalDays = 1;
		this.coins = configuration.modifierId === 'scarcity' ? 58 : 70;
		this.reputation = 76;
		this.inspections = 2;
		this.inventory = Object.fromEntries(MARKET_GOODS.map(good => [good.id, 0]));
		this.cityPrices = Object.fromEntries(MARKET_GOODS.map(good => [good.id, good.publicPrice]));
		this.stalls = orderedForSeed(MARKET_STALLS, configuration.seed).map(record => ({
			...record,
			inspected: false,
			calibrated: false,
			bought: false,
			secured: false
		}));
		this.score = 0;
		this.ended = false;
		this.won = false;
	}

	inspect(index) {
		const stall = this.stalls[index];
		if (!stall || stall.inspected || this.inspections <= 0 || this.ended) {
			return marketFailure('Choose an uninspected stall while a standard token remains.');
		}
		this.inspections -= 1;
		stall.inspected = true;
		this.score += stall.honest ? 40 : 150;
		return marketSuccess(stall.finding);
	}

	calibrate(index) {
		const stall = this.stalls[index];
		if (!stall || stall.calibrated || this.coins < 12 || this.ended) {
			return marketFailure('Independent calibration costs 12 coins and may be used once per stall.');
		}
		this.coins -= 12;
		stall.calibrated = true;
		stall.inspected = true;
		return marketSuccess(`Independent calibration: ${stall.finding}`);
	}

	secure(index) {
		const stall = this.stalls[index];
		if (!stall?.inspected || stall.honest || stall.secured || this.ended) {
			return marketFailure('Only an inspected false physical measure can enter custody.');
		}
		stall.secured = true;
		this.score += 100;
		return marketSuccess('The hollow weight is sealed, labeled, and entered into custody.');
	}

	buy(index) {
		const stall = this.stalls[index];
		if (!stall || stall.bought || this.coins < stall.price || this.ended) {
			return marketFailure('That purchase is unavailable or unaffordable.');
		}
		stall.bought = true;
		this.coins -= stall.price;
		if (!stall.honest) {
			this.reputation -= 20;
			return marketFailure('Payment bought an underweight sack; price was not proof of honesty.');
		}
		this.inventory[stall.good] += 1;
		this.score += 60;
		return marketSuccess(`Purchased verified ${stall.good} from ${stall.name}.`);
	}

	sell(goodId) {
		if (!this.inventory[goodId] || this.ended) {
			return marketFailure('No verified unit of that good is available to sell.');
		}
		this.inventory[goodId] -= 1;
		this.coins += this.cityPrices[goodId];
		this.reputation = Math.min(100, this.reputation + 3);
		return marketSuccess(`Sold ${goodId} at the visible public price.`);
	}

	nextDay() {
		if (this.ended) {
			return;
		}
		this.day = 2;
		this.ended = true;
		this.won = this.reputation > 0;
		this.score += this.coins * 4 + this.reputation * 8;
	}

	resultDetails() {
		return marketResult(this);
	}

	snapshot() {
		return marketSnapshot(this);
	}
}
