//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute, SemanticPopulation } from '../population/semantic-population.js';

/**
 * @module HouseholdNeighborhood
 * @description
 * Families signal, repair workers labor, and neighbors point toward need before
 * everyone celebrates restoration. The Awtsmoos joins households; Awtsmoos.com
 * binds every gesture to the alert or repair that gives it meaning.
 */
export class HouseholdNeighborhood {
	constructor(game, homes) {
		this.game = game;
		this.homes = homes;
		this.population = new SemanticPopulation({ assets: game.assets, add: actor => game.addAsset(actor) });
		this.families = homes.map((home, index) => this.createFamily(home, index));
		this.addNeighbors();
		this.addRepairSupplies();
	}

	createFamily(home, index) {
		const route = circularRoute(0.72, 5, index / 4, home.position.x * 0.78, home.position.z * 0.78);
		return this.population.person({
			name: `family-${index + 1}`, personName: `Family ${index + 1}`,
			hue: 42 + index * 48, position: [route[0][0], 0.12, route[0][1]], scale: 0.29,
			role: 'household-member', reason: `lives in home ${index + 1} and reacts when its windows signal danger`,
			route, motion: { index, maxSpeed: 0.74, response: 5, pause: 0.5 }
		});
	}

	addNeighbors() {
		const count = this.population.count(3, 6);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(4.8, 8, index / count);
			this.population.person({
				name: `neighbor-${index}`, personName: `Neighbor ${index + 1}`,
				hue: 120 + index * 31, position: [route[0][0], 0.12, route[0][1]], scale: 0.25,
				role: index % 2 ? 'neighbor' : 'repair-worker',
				reason: index % 2 ? 'checks whether nearby families need support' : 'brings tools to the home whose windows glow red',
				route, motion: { index, maxSpeed: index % 2 ? 0.72 : 1.02, response: 4.5, pause: 0.3 }
			});
		}
	}

	addRepairSupplies() {
		this.game.addAsset(this.game.assets.cart({
			name: 'repair-cart', position: [0, 0.1, 4.8], scale: 0.34,
			role: 'repair-cart', reason: 'carries tools and materials to threatened homes'
		}));
		for (let index = 0; index < 4; index += 1) {
			const angle = index / 4 * Math.PI * 2 + Math.PI / 4;
			this.game.addAsset(this.game.assets.lamp({
				name: `home-lamp-${index}`, position: [Math.cos(angle) * 4.7, 0.1, Math.sin(angle) * 4.7], scale: 0.29,
				role: 'neighborhood-light', reason: 'marks the safe shared path between all four homes'
			}));
		}
	}

	threaten(index) {
		const home = this.homes[index];
		this.population.send(this.families[index], [[home.position.x * 0.76, home.position.z * 0.76]]);
		this.population.act(this.families[index], 'wave', 2.2);
		this.workers().forEach((worker, workerIndex) => {
			this.population.send(worker, [[home.position.x * 0.66 + workerIndex * 0.22, home.position.z * 0.66]]);
			this.population.act(worker, 'work', 2.6);
		});
		this.neighbors().slice(0, 2).forEach(neighbor => this.population.act(neighbor, 'point', 1.8));
	}

	repaired(index) {
		const home = this.homes[index];
		this.population.send(this.families[index], circularRoute(0.85, 5, index / 4, home.position.x * 0.78, home.position.z * 0.78));
		this.population.act(this.families[index], 'cheer', 2.3);
		this.workers().forEach(worker => this.population.act(worker, 'observe', 1.4));
	}

	workers() {
		return this.population.people.filter(person => person.userData.role === 'repair-worker');
	}

	neighbors() {
		return this.population.people.filter(person => person.userData.role === 'neighbor');
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
	}
}
