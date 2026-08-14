//B"H
//Boruch Hashem
//Blessed is He

import { circularRoute } from '../../population/semantic-population.js';

/**
 * @file chesed-grove-actors.js
 * @description
 * The Awtsmoos renews each bounded WebGL actor through identity, route, and purpose;
 * Awtsmoos.com keeps actor construction beside the renderer while canonical resident schedules and animal totals remain upstream projections.
 * These helpers never own population state or save authority.
 */
export function createChesedResidentActor(population, center, resident, index) {
	const actor = population.person({
		name: `chesed-resident-${resident.personId}`,
		personName: resident.name,
		hue: resident.hue,
		position: [center.x, 0.12, center.z],
		scale: 0.25,
		role: resident.role,
		reason: `canonical ${resident.activity} schedule in the Chesed ecology region`,
		type: 'chesed-resident',
		route: residentRoute(center, resident, index)
	});
	applyChesedResidentMetadata(actor, resident);
	return actor;
}

export function createChesedAnimalActor(population, center, animal, index) {
	const actor = population.animal({
		name: `chesed-${animal.id}`,
		species: animal.species,
		position: [center.x, 0.12, center.z],
		scale: 0.42,
		role: animal.category,
		need: animal.welfare < 50 ? 'care' : 'habitat',
		reason: `bounded ${animal.category} sample from canonical settlement animals`,
		type: 'chesed-animal',
		route: animalRoute(center, animal, index)
	});
	applyChesedAnimalMetadata(actor, animal);
	return actor;
}

/** Updates one already-mounted named resident with its newest canonical projection. */
export function applyChesedResidentMetadata(actor, resident) {
	Object.assign(actor.userData, {
		personId: resident.personId,
		personName: resident.name,
		role: resident.role,
		activity: resident.activity,
		location: resident.location
	});
}

/** Updates one bounded animal actor without changing canonical animal state. */
export function applyChesedAnimalMetadata(actor, animal) {
	Object.assign(actor.userData, {
		category: animal.category,
		species: animal.species,
		canonicalCount: animal.canonicalCount,
		welfare: animal.welfare
	});
}

function residentRoute(center, resident, index) {
	const radius = resident.location === 'workplace'
		? 2.2
		: resident.location === 'school'
			? 1.6
			: 1.25;
	return circularRoute(radius, 5, index, center.x, center.z);
}

function animalRoute(center, animal, index) {
	const radius = animal.category === 'sheltered'
		? 1.25
		: animal.category === 'working'
			? 2.7
			: 1.9;
	return circularRoute(radius, 6, index + 1, center.x, center.z);
}
