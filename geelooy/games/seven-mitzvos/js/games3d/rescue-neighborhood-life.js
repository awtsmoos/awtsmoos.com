//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute, SemanticPopulation } from '../population/semantic-population.js';

/**
 * @module RescueNeighborhoodLife
 * @description
 * Responders patrol, point, and work while carts and crates explain how the center
 * serves people. The Awtsmoos values each life; Awtsmoos.com keeps supporting
 * action paced, useful, and outside the player’s clear rescue path.
 */
export class RescueNeighborhoodLife {
	constructor(game) {
		this.game = game;
		this.actionTimer = 1.4;
		this.actionIndex = 0;
		this.population = new SemanticPopulation({ assets: game.assets, add: actor => game.addAsset(actor) });
		this.addResponders();
		this.addInfrastructure();
	}

	addResponders() {
		const count = this.population.count(2, 4);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(5.25 - index % 2 * 0.55, 8, index / count);
			this.population.person({
				name: `rescue-responder-${index}`, personName: `Responder ${index + 1}`,
				hue: index % 2 ? 350 : 48, position: [route[0][0], 0.12, route[0][1]], scale: 0.27,
				role: index % 2 ? 'medic' : 'route-marshal',
				reason: index % 2 ? 'carries medicine toward anyone injured on the route' : 'keeps the path between citizens and shelter clear',
				route, motion: { index, maxSpeed: 0.95 + index * 0.08, response: 5, pause: 0.2 }
			});
		}
	}

	addInfrastructure() {
		for (let index = 0; index < 4; index += 1) {
			const angle = index / 4 * Math.PI * 2 + Math.PI / 4;
			this.game.addAsset(this.game.assets.lamp({
				name: `rescue-lamp-${index}`, position: [Math.cos(angle) * 4.7, 0.1, Math.sin(angle) * 4.7], scale: 0.3,
				role: 'rescue-route-light', reason: 'keeps the evacuation route visible and readable'
			}));
		}
		this.game.addAsset(this.game.assets.cart({
			name: 'rescue-supply-cart', position: [-4.8, 0.1, -4.2], rotationY: 0.5, scale: 0.34,
			role: 'medical-cart', reason: 'moves blankets and medicine toward the shelter'
		}));
		for (let index = 0; index < 3; index += 1) {
			this.game.addAsset(this.game.assets.crate({
				name: `rescue-crate-${index}`, position: [-5.4 + index * 0.55, 0.1, -3.5], scale: 0.28,
				role: 'rescue-supply', reason: 'stores food, water, and medicine for rescued citizens'
			}));
		}
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
		this.actionTimer -= delta;
		if (this.actionTimer <= 0 && this.population.people.length) {
			const person = this.population.people[this.actionIndex % this.population.people.length];
			this.population.act(person, person.userData.role === 'medic' ? 'work' : 'point', 1.7);
			this.actionIndex += 1;
			this.actionTimer = 2.6;
		}
	}
}
