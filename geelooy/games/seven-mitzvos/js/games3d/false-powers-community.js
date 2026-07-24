//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute, SemanticPopulation } from '../population/semantic-population.js';

/**
 * @module FalsePowersCommunity
 * @description
 * Residents move away from corrupt broadcasts, responders point to safe routes,
 * and the whole community cheers purification. The Awtsmoos alone is true power;
 * Awtsmoos.com gives every gesture a civic cause rather than random animation.
 */
export class FalsePowersCommunity {
	constructor(game) {
		this.game = game;
		this.population = new SemanticPopulation({ assets: game.assets, add: actor => game.addAsset(actor) });
		this.normalRoutes = [];
		this.addResidents();
		this.addStreetFurniture();
	}

	addResidents() {
		const count = this.population.count(4, 7);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(4.75, 8, index / count);
			this.normalRoutes.push(route);
			this.population.person({
				name: `tower-resident-${index}`, personName: `Resident ${index + 1}`,
				hue: 48 + index * 37, position: [route[0][0], 0.12, route[0][1]], scale: 0.28,
				role: index < 2 ? 'safety-responder' : 'district-resident',
				reason: index < 2 ? 'guides neighbors away from corrupt broadcasts' : 'lives beside the towers and reacts to their public message',
				route, motion: { index, maxSpeed: index < 2 ? 1.15 : 0.82, response: 5, pause: 0.2 }
			});
		}
	}

	addStreetFurniture() {
		for (let index = 0; index < 4; index += 1) {
			const angle = index / 4 * Math.PI * 2 + Math.PI / 4;
			this.game.addAsset(this.game.assets.lamp({
				name: `tower-lamp-${index}`, position: [Math.cos(angle) * 5.35, 0.1, Math.sin(angle) * 5.35], scale: 0.32,
				role: 'evacuation-light', reason: 'marks the safe outer route during a corrupt broadcast'
			}));
		}
		for (let index = 0; index < 2; index += 1) {
			this.game.addAsset(this.game.assets.bench({
				name: `tower-bench-${index}`, position: [index ? 5.4 : -5.4, 0.1, 0], rotationY: index ? -Math.PI / 2 : Math.PI / 2, scale: 0.32,
				role: 'community-bench', reason: 'gives residents a gathering place after purification'
			}));
		}
	}

	evacuate(tower) {
		const dangerAngle = Math.atan2(tower.position.z, tower.position.x);
		this.population.people.forEach((person, index) => {
			const angle = dangerAngle + Math.PI + (index - 2) * 0.12;
			this.population.send(person, [[Math.cos(angle) * 5.8, Math.sin(angle) * 5.8], [Math.cos(angle + 0.22) * 5.45, Math.sin(angle + 0.22) * 5.45]]);
			this.population.act(person, person.userData.role === 'safety-responder' ? 'point' : 'observe', 2.2);
		});
	}

	celebrate(tower) {
		const centerX = tower.position.x * 0.72;
		const centerZ = tower.position.z * 0.72;
		this.population.people.forEach((person, index) => {
			this.population.send(person, circularRoute(1.25, 6, index / 6, centerX, centerZ));
			this.population.act(person, 'cheer', 2.4);
		});
	}

	resumePatrols() {
		this.population.people.forEach((person, index) => {
			this.population.send(person, this.normalRoutes[index], index);
			this.population.act(person, 'observe', 1.2);
		});
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
	}
}
