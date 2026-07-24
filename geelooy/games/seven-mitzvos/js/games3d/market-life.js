//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute, SemanticPopulation } from '../population/semantic-population.js';

/**
 * @module MarketLife
 * @description
 * Merchants greet, customers compare, porters work, and fair value produces a
 * visible celebration and queue. The Awtsmoos renews exchange; Awtsmoos.com ties
 * every gesture to honest trade while preserving adaptive population limits.
 */
export class MarketLife {
	constructor(game, stalls) {
		this.game = game;
		this.stalls = stalls;
		this.population = new SemanticPopulation({ assets: game.assets, add: actor => game.addAsset(actor) });
		this.routes = [];
		this.addMerchants();
		this.addCustomers();
		this.addPorters();
		this.addGoods();
	}

	addMerchants() {
		this.stalls.forEach((stall, index) => {
			const merchant = this.population.person({
				name: `merchant-${index + 1}`, personName: `Merchant ${index + 1}`,
				hue: 40 + index * 70, position: [stall.position.x, 0.12, -1.25], scale: 0.34,
				role: 'merchant', reason: `serves goods and explains the visible value at stall ${index + 1}`,
				route: [[stall.position.x, -1.25]], motion: { maxSpeed: 0.2, response: 3 }
			});
			this.population.act(merchant, 'wave', 1.5 + index * 0.2);
		});
	}

	addCustomers() {
		const count = this.population.count(5, 10);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(4.5 - index % 2 * 0.45, 9, index / count);
			this.routes.push(route);
			this.population.person({
				name: `market-customer-${index}`, personName: `Customer ${index + 1}`,
				hue: 38 + index * 27, position: [route[0][0], 0.12, route[0][1]], scale: 0.25,
				role: 'customer', reason: 'compares visible quality and price before joining a fair queue',
				route, motion: { index, maxSpeed: 0.82, response: 4.5, pause: 0.35 }
			});
		}
	}

	addPorters() {
		const count = this.population.count(2, 4);
		for (let index = 0; index < count; index += 1) {
			const route = [[-5.4, -2.8 + index], [5.4, -2.8 + index], [0, -4.4]];
			this.population.person({
				name: `market-porter-${index}`, personName: `Porter ${index + 1}`,
				hue: 205 + index * 32, position: [route[0][0], 0.12, route[0][1]], scale: 0.27,
				role: 'porter', reason: 'moves fresh goods from the supply cart to all three stalls',
				route, motion: { index, maxSpeed: 1.05, response: 5, pause: 0.25 }
			});
		}
	}

	addGoods() {
		this.game.addAsset(this.game.assets.cart({
			name: 'market-supply-cart', position: [0, 0.1, -4.8], scale: 0.4,
			role: 'goods-cart', reason: 'delivers shared stock so stall quality can be compared honestly'
		}));
		for (let index = 0; index < 6; index += 1) {
			this.game.addAsset(this.game.assets.crate({
				name: `market-crate-${index}`, position: [-2.1 + index * 0.82, 0.1, -3.8], scale: 0.25,
				role: 'goods-crate', reason: 'stores visible food and tools offered by the market'
			}));
		}
	}

	openDay() {
		this.customers().forEach((customer, index) => {
			this.population.send(customer, this.routes[index], index);
			this.population.act(customer, 'observe', 1.4);
		});
		this.porters().forEach(porter => this.population.act(porter, 'work', 1.8));
	}

	queueAt(index) {
		const stall = this.stalls[index];
		this.customers().forEach((customer, customerIndex) => {
			const row = Math.floor(customerIndex / 3);
			const column = customerIndex % 3 - 1;
			this.population.send(customer, [[stall.position.x + column * 0.42, stall.position.z + 1.6 + row * 0.52]]);
			this.population.act(customer, 'cheer', 2.1);
		});
		this.population.act(this.merchants()[index], 'wave', 2.2);
	}

	customers() {
		return this.byRole('customer');
	}

	merchants() {
		return this.byRole('merchant');
	}

	porters() {
		return this.byRole('porter');
	}

	byRole(role) {
		return this.population.people.filter(person => person.userData.role === role);
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
	}
}
