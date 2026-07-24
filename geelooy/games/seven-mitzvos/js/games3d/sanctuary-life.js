//B"H
//Boruch Hashem
//Blessed is He

import { animateAnimal } from '../procedural/animal-factory.js';
import { advanceRoute, assignRoute } from '../motion/smooth-motion.js';
import { circularRoute, SemanticPopulation } from '../population/semantic-population.js';

/**
 * @module SanctuaryLife
 * @description
 * Caregivers comfort selected animals, keepers work, and healthy creatures graze
 * around bounded habitat routes. The Awtsmoos sustains each breath; Awtsmoos.com
 * makes every humane gesture correspond to a visible need.
 */
export class SanctuaryLife {
	constructor(game, animals) {
		this.game = game;
		this.animals = animals;
		this.population = new SemanticPopulation({ assets: game.assets, add: actor => game.addAsset(actor) });
		this.addCaregivers();
		this.addAmbientAnimals();
		this.addHabitatProps();
		this.assignAnimalRoutes();
	}

	addCaregivers() {
		const count = this.population.count(2, 4);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(4.6, 8, index / count);
			this.population.person({
				name: `caregiver-${index}`, personName: `Caregiver ${index + 1}`,
				hue: 145 + index * 27, position: [route[0][0], 0.12, route[0][1]], scale: 0.27,
				role: index % 2 ? 'habitat-keeper' : 'animal-caregiver',
				reason: index % 2 ? 'maintains shelter, food, and clean habitat space' : 'approaches the selected animal to assist its exact care',
				route, motion: { index, maxSpeed: 0.85, response: 4.5, pause: 0.4 }
			});
		}
	}

	addAmbientAnimals() {
		const count = this.population.count(2, 5);
		for (let index = 0; index < count; index += 1) {
			const route = circularRoute(4.9 - index % 2 * 0.45, 7, index / count);
			this.population.animal({
				name: `healthy-animal-${index}`, species: index % 2 ? 'sheep' : 'deer',
				hue: 30 + index * 25, position: [route[0][0], 0.12, route[0][1]], scale: 0.24,
				role: 'healthy-resident', reason: 'shows the calm condition restored by correct care',
				route, motion: { index, maxSpeed: 0.44, response: 3.2, pause: 0.7 }
			});
		}
	}

	addHabitatProps() {
		for (let index = 0; index < 4; index += 1) {
			this.game.addAsset(this.game.assets.crate({
				name: `care-crate-${index}`, hue: 48 + index * 48,
				position: [-2.1 + index * 1.4, 0.1, -4.3], scale: 0.26,
				role: 'care-supply', reason: 'stores food, medicine, blankets, or calming tools'
			}));
		}
		this.game.addAsset(this.game.assets.bench({
			name: 'caregiver-bench', position: [4.8, 0.1, 3.7], rotationY: -0.8, scale: 0.32,
			role: 'caregiver-rest', reason: 'gives caregivers a place to observe recovering animals'
		}));
	}

	assignAnimalRoutes() {
		this.animals.forEach((animal, index) => {
			const route = circularRoute(0.72, 5, index / this.animals.length, animal.position.x, animal.position.z);
			assignRoute(animal, route, { index, maxSpeed: 0.32, response: 3, turnRate: 7, pause: 0.55, facingOffset: Math.PI / 2 });
		});
	}

	focus(animal) {
		this.caregivers().forEach((caregiver, index) => {
			this.population.send(caregiver, [[animal.position.x - 1 + index * 0.7, animal.position.z + 1.15]]);
			this.population.act(caregiver, 'comfort', 2.2);
		});
		this.keepers().forEach(keeper => this.population.act(keeper, 'work', 1.8));
	}

	caregivers() {
		return this.population.people.filter(person => person.userData.role === 'animal-caregiver');
	}

	keepers() {
		return this.population.people.filter(person => person.userData.role === 'habitat-keeper');
	}

	update(delta, elapsed, selected, stateFor) {
		this.population.update(delta, elapsed);
		this.animals.forEach(animal => {
			const moving = advanceRoute(animal, delta);
			const state = animal === selected ? stateFor(animal.userData.need) : moving ? 'walking' : 'calm';
			animateAnimal(animal, elapsed, state);
		});
	}
}
