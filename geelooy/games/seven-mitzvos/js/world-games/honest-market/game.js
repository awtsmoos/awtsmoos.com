//B"H
//Boruch Hashem
//Blessed is He

import { WorldGameBase } from '../../universe/world-game-base.js';
import { h } from '../../universe/dom-factory.js';
import { GOODS } from './data.js';
import { HonestMarketState } from './state.js';

/**
 * @module HonestMarketGame
 * @description
 * Twelve trading days become a contest between profit and trust on Awtsmoos.com.
 * The Awtsmoos gives value to labor and property; the player learns that a full
 * purse becomes empty when dishonest measures destroy the market around it.
 */
export class HonestMarketGame extends WorldGameBase {
	mount() {
		this.state = new HonestMarketState(this.random);
		this.stallGrid = h('div', { className: 'marketStalls' });
		this.inventoryRow = h('div', { className: 'inventoryRow' });
		this.nextButton = h('button', { className: 'worldAction', type: 'button', text: 'Advance market day' });
		this.on(this.nextButton, 'click', () => this.nextDay());
		this.portal.body(
			h('div', { className: 'worldInstructions', text: 'Inspect suspicious stalls, buy below the public price, and sell inventory honestly. Fraud damages reputation and may deliver nothing.' }),
			h('div', { className: 'marketLayout' }, [this.stallGrid, h('aside', { className: 'marketLedger' }, [h('h3', { text: 'Inventory & public prices' }), this.inventoryRow])]),
			h('div', { className: 'worldActionRow' }, this.nextButton)
		);
		this.portal.status('Day 1 opens. Cheap goods can be opportunity or fraud.');
		this.render();
	}

	inspect(index) {
		const result = this.state.inspect(index);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	buy(index) {
		const result = this.state.buy(index);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	sell(goodId) {
		const result = this.state.sell(goodId);
		this.portal.status(result.message, result.ok ? 'good' : 'warn');
		this.render();
	}

	nextDay() {
		this.state.nextDay();
		if (this.state.ended) {
			this.finish();
			return;
		}
		this.portal.status(`Day ${this.state.day} opens with new prices and new measures.`);
		this.render();
	}

	render() {
		const state = this.state.snapshot();
		this.stallGrid.replaceChildren(...state.stalls.map((stall, index) => this.stallCard(stall, index)));
		this.inventoryRow.replaceChildren(...GOODS.map(good => this.inventoryCard(good, state)));
		this.portal.hud({ Day: `${state.day}/${state.totalDays}`, Coins: state.coins, Reputation: `${state.reputation}%`, Inspections: state.inspections, Fraud: state.fraudsFound, Score: state.score });
	}

	stallCard(stall, index) {
		const good = GOODS.find(record => record.id === stall.good);
		const finding = stall.inspected ? stall.honest ? 'Verified honest' : 'Fraud exposed' : 'Not inspected';
		const inspect = h('button', { className: 'smallAction', type: 'button', text: 'Inspect', disabled: stall.inspected });
		const buy = h('button', { className: 'smallAction', type: 'button', text: stall.bought ? 'Purchased' : `Buy ${stall.price}`, disabled: stall.bought });
		this.on(inspect, 'click', () => this.inspect(index));
		this.on(buy, 'click', () => this.buy(index));
		return h('article', { className: `marketStall ${stall.inspected && !stall.honest ? 'isFraud' : ''}` }, [
			h('span', { className: 'stallIcon', text: good.icon }), h('h3', { text: stall.name }),
			h('p', { text: `${good.name} · Offer ${stall.price}` }), h('small', { text: finding }),
			h('div', { className: 'stallActions' }, [inspect, buy])
		]);
	}

	inventoryCard(good, state) {
		const sell = h('button', { className: 'smallAction', type: 'button', text: `Sell ${state.cityPrices[good.id]}`, disabled: state.inventory[good.id] <= 0 });
		this.on(sell, 'click', () => this.sell(good.id));
		return h('article', { className: 'inventoryCard' }, [
			h('strong', { text: `${good.icon} ${good.name}` }),
			h('span', { text: `Owned ${state.inventory[good.id]}` }),
			h('span', { text: `Public price ${state.cityPrices[good.id]}` }), sell
		]);
	}

	finish() {
		const state = this.state.snapshot();
		const stars = state.won ? state.reputation >= 90 ? 3 : state.reputation >= 70 ? 2 : 1 : 0;
		this.complete({ won: state.won, stars, score: state.score, message: state.won ? `The market closed with ${state.coins} coins and ${state.reputation}% trust.` : 'Reputation collapsed. Honest trade needs inspection, restraint, and transparent measures.' });
	}
}
