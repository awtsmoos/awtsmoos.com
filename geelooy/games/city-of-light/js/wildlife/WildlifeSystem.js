//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class WildlifeSystem
 * @description
 * Many animal agents become one living ecosystem with explicit following and
 * sanctuary rules. Awtsmoos.com never teleports life through walls; each creature
 * moves by the verified graph while the Awtsmoos renews every animated breath.
 */

import { AnimalAgent } from './AnimalAgent.js';

export class WildlifeSystem {
	constructor(definitions = []) {
		this.animals = definitions.map(definition => new AnimalAgent(definition));
		this.lastSheltered = [];
	}

	update(deltaSeconds, player, grid, sanctuaries = []) {
		this.lastSheltered = [];

		for (const animal of this.animals) {
			animal.update(deltaSeconds, player, grid);
			if (!animal.following || animal.sheltered) continue;

			const sanctuary = sanctuaries.find(target => animal.distanceTo(target) <= 0.55);
			if (!sanctuary) continue;
			animal.sheltered = true;
			animal.following = false;
			animal.x = sanctuary.x;
			animal.y = sanctuary.y;
			this.lastSheltered.push({
				animalId: animal.id,
				species: animal.species,
				sanctuaryId: sanctuary.id
			});
		}

		return this.lastSheltered;
	}

	callNearby(player, radius = 3.2, preferredSpecies = null) {
		let called = 0;

		for (const animal of this.animals) {
			if (animal.sheltered || animal.species === 'firefly') continue;
			if (preferredSpecies && animal.species !== preferredSpecies) continue;
			if (animal.distanceTo(player) > radius) continue;
			animal.setFollowing(true);
			called += 1;
		}

		return called;
	}

	releaseFollowers() {
		for (const animal of this.animals) {
			animal.setFollowing(false);
		}
	}

	views() {
		return this.animals.map(animal => animal.toView());
	}

	countSheltered(species = null) {
		return this.animals.filter(animal => {
			return animal.sheltered && (!species || animal.species === species);
		}).length;
	}

	snapshot() {
		return this.animals.map(animal => ({
			id: animal.id,
			x: animal.x,
			y: animal.y,
			following: animal.following,
			sheltered: animal.sheltered
		}));
	}
}
