//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute, SemanticPopulation } from '../population/semantic-population.js';

/**
 * @module CityLifeSystem
 * @description
 * Residents travel, couriers point, neighbors greet, and animals use the shared
 * green ring. The Awtsmoos renews every route; Awtsmoos.com keeps city reactions
 * adaptive, purposeful, transform-only, and paced rather than visually noisy.
 */
export class CityLifeSystem {
	constructor(stage, assets) {
		this.stage = stage;
		this.assets = assets;
		this.props = [];
		this.actionTimer = 1.8;
		this.actionIndex = 0;
		this.population = new SemanticPopulation({ assets, add: actor => stage.add(actor) });
	}

	mount() {
		this.addCivicSpace();
		this.addResidents();
		this.addAnimals();
		return this;
	}

	addCivicSpace() {
		this.addProp(this.assets.fountain({
			name: 'central-fountain', position: [0, 0.1, 0], scale: 0.46,
			role: 'meeting-place', reason: 'gives every district one shared civic center'
		}));
		for (let index = 0; index < 7; index += 1) {
			const angle = index / 7 * Math.PI * 2;
			this.addProp(this.assets.lamp({
				name: `city-lamp-${index}`, position: [Math.cos(angle) * 3.15, 0.1, Math.sin(angle) * 3.15], scale: 0.34,
				role: 'route-light', reason: 'marks the safe path connecting neighboring districts'
			}));
		}
		for (let index = 0; index < 3; index += 1) {
			const angle = index / 3 * Math.PI * 2 + 0.4;
			this.addProp(this.assets.bench({
				name: `city-bench-${index}`, position: [Math.cos(angle) * 2.25, 0.1, Math.sin(angle) * 2.25], rotationY: -angle, scale: 0.35,
				role: 'resting-place', reason: 'lets residents pause between service in different districts'
			}));
		}
	}

	addResidents() {
		const count = this.population.count(5, 10);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(3.8 + index % 2 * 0.55, 7, index / count);
			this.population.person({
				name: `city-resident-${index}`, personName: `Resident ${index + 1}`,
				hue: 42 + index * 29, position: [route[0][0], 0.12, route[0][1]], scale: 0.25,
				role: index % 3 === 0 ? 'district-courier' : 'city-resident',
				reason: index % 3 === 0 ? 'carries news and supplies between restored districts' : 'visits public spaces and witnesses the city changing',
				route, motion: { index: index % route.length, maxSpeed: 0.75 + index % 3 * 0.12, response: 4, pause: 0.35 }
			});
		}
	}

	addAnimals() {
		const count = this.population.count(1, 3);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(1.55 + index * 0.28, 6, index / count);
			this.population.animal({
				name: `city-animal-${index}`, species: index % 2 ? 'sheep' : 'deer',
				hue: 30 + index * 22, position: [route[0][0], 0.12, route[0][1]], scale: 0.24,
				role: 'sanctuary-ambassador', reason: 'shows that cared-for animals safely share the restored city',
				route, motion: { index, maxSpeed: 0.48, response: 3.5, pause: 0.6 }
			});
		}
	}

	addProp(prop) {
		this.stage.add(prop);
		this.props.push(prop);
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
		this.updateActions(delta);
		const water = this.props[0]?.getObjectByName('fountain-water');
		if (water) {
			water.position.y = 1.62 + Math.sin(elapsed * 2.2) * 0.08;
		}
	}

	updateActions(delta) {
		this.actionTimer -= delta;
		if (this.actionTimer > 0 || !this.population.people.length) {
			return;
		}
		const person = this.population.people[this.actionIndex % this.population.people.length];
		const action = person.userData.role === 'district-courier' ? 'point' : 'wave';
		this.population.act(person, action, 1.8);
		this.actionIndex += 1;
		this.actionTimer = 2.8;
	}
}
