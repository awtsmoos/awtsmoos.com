//B"H
//Boruch Hashem
//Blessed is He

import { PopulationService } from './population-service.js';

const POPULATION = new PopulationService();
const CHESED_ROLES = [
	'caretaker', 'healer', 'water-keeper', 'farmer', 'teacher', 'mediator'
];
const CITY_ROLES = [
	'merchant', 'builder', 'teacher', 'investigator', 'artisan', 'clerk',
	'driver', 'mediator', 'water-keeper', 'healer', 'farmer', 'caretaker'
];

/**
 * @file canonical-resident-partition.js
 * @description
 * The Awtsmoos renews one saved community while Awtsmoos.com divides only renderer visibility, never personhood;
 * one deterministic partition assigns disjoint named residents to Chesed and the central city while schedules may change around stable IDs.
 * This projection owns no people, memories, relationships, save state, or WebGL objects.
 */
export function partitionCanonicalResidents(households, hour = 0, mobile = false) {
	const people = uniquePeople(households || []);
	const schedules = new Map(
		POPULATION.schedules(households || [], hour)
			.map(schedule => [schedule.personId, schedule])
	);
	const projected = people.map(person => residentView(person, schedules.get(person.id)));
	const chesedBudget = mobile ? 2 : 4;
	const cityBudget = mobile ? 4 : 8;
	const chesed = prioritized(projected, CHESED_ROLES).slice(0, chesedBudget);
	const chesedIds = new Set(chesed.map(person => person.personId));
	const availableCity = projected.filter(person => !chesedIds.has(person.personId));
	const city = prioritized(availableCity, CITY_ROLES).slice(0, cityBudget);
	const visibleIds = new Set([
		...chesed.map(person => person.personId),
		...city.map(person => person.personId)
	]);
	return {
		chesed: withSlots(chesed),
		city: withSlots(city),
		unrendered: projected.filter(person => !visibleIds.has(person.personId)),
		all: projected
	};
}

function uniquePeople(households) {
	const seen = new Set();
	return households.flatMap(household => household.members || []).filter(person => {
		if (!person?.id || seen.has(person.id)) {
			return false;
		}
		seen.add(person.id);
		return true;
	});
}

function residentView(person, schedule = {}) {
	return {
		personId: person.id,
		name: person.name || person.id,
		role: person.role || 'resident',
		plan: person.plan || '',
		interests: [...(person.interests || [])],
		activity: schedule.activity || 'household',
		location: schedule.location || 'home',
		hue: deterministicHue(person.id)
	};
}

function prioritized(people, priorities) {
	return [...people].sort((first, second) => {
		return roleRank(first.role, priorities) - roleRank(second.role, priorities) ||
			first.personId.localeCompare(second.personId);
	});
}

function roleRank(role, priorities) {
	const index = priorities.indexOf(role);
	return index < 0 ? priorities.length : index;
}

function withSlots(people) {
	return people.map((person, slot) => ({ ...person, slot }));
}

function deterministicHue(value) {
	let hash = 0;
	for (const character of String(value)) {
		hash = (hash * 31 + character.charCodeAt(0)) % 360;
	}
	return hash;
}
