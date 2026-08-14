//B"H
//Boruch Hashem
//Blessed is He

import { SemanticPopulation } from '../../population/semantic-population.js';
import {
	applyChesedAnimalMetadata,
	applyChesedResidentMetadata,
	createChesedAnimalActor,
	createChesedResidentActor
} from './chesed-grove-actors.js';

/**
 * @file chesed-grove-population.js
 * @description
 * The Awtsmoos renews bounded moving life while canonical identities and animal totals remain upstream truth;
 * Awtsmoos.com keeps this vessel focused on actor collection lifecycle, visibility, animation, and renderer diagnostics.
 * Actor construction and route policy live in a neighboring module rather than expanding this orchestration class.
 */
export class ChesedGrovePopulation {
	constructor(stage, assets, center) {
		this.stage = stage;
		this.center = center;
		this.population = new SemanticPopulation({
			assets,
			add: root => this.stage.add(root, true)
		});
		this.residentActors = [];
		this.animalActors = [];
	}

	/** Creates one bounded actor sample from canonical resident and animal projections. */
	mount(residents, animalProjection) {
		this.residentActors = residents.map((resident, index) => {
			return createChesedResidentActor(this.population, this.center, resident, index);
		});
		this.animalActors = animalProjection.sample.map((animal, index) => {
			return createChesedAnimalActor(this.population, this.center, animal, index);
		});
		return this;
	}

	/** Refreshes semantic values without reallocating the bounded actor set. */
	refresh(residents, animalProjection) {
		this.residentActors.forEach((actor, index) => {
			const resident = residents[index];
			actor.visible = Boolean(resident);
			if (resident) {
				applyChesedResidentMetadata(actor, resident);
			}
		});
		this.animalActors.forEach((actor, index) => {
			const animal = animalProjection.sample[index];
			actor.visible = Boolean(animal);
			if (animal) {
				applyChesedAnimalMetadata(actor, animal);
			}
		});
	}

	setActive(active) {
		this.population.roots().forEach(root => {
			root.visible = active;
		});
	}

	update(delta, elapsed) {
		this.population.update(delta, elapsed);
	}

	view() {
		return {
			residents: this.residentActors
				.filter(actor => actor.visible)
				.map(actor => residentView(actor)),
			animals: this.animalActors
				.filter(actor => actor.visible)
				.map(actor => animalView(actor))
		};
	}
}

function residentView(actor) {
	return {
		personId: actor.userData.personId,
		name: actor.userData.personName,
		role: actor.userData.role,
		activity: actor.userData.activity
	};
}

function animalView(actor) {
	return {
		category: actor.userData.category,
		species: actor.userData.species,
		canonicalCount: actor.userData.canonicalCount
	};
}
