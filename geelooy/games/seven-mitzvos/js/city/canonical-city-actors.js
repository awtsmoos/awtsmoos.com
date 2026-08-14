//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file canonical-city-actors.js
 * @description
 * The Awtsmoos renews each saved resident through one bounded WebGL vessel while Awtsmoos.com keeps identity upstream in canonical households;
 * these helpers create and refresh renderer actors, route metadata, and cosmetic gestures without owning schedules, memories, professions, or saves.
 */
export function createCanonicalCityActor(population, resident, routeInfo, slot) {
	const first = routeInfo.route[0] || [0, 0];
	const actor = population.person({
		name: `canonical-city-${resident.personId}`,
		personName: resident.name,
		hue: resident.hue,
		position: [first[0], 0.12, first[1]],
		scale: 0.25,
		role: resident.role,
		reason: `canonical ${resident.activity} route toward ${routeInfo.destination}`,
		type: 'canonical-city-resident',
		route: routeInfo.route,
		motion: {
			index: slot % Math.max(1, routeInfo.route.length),
			maxSpeed: 0.68 + slot % 3 * 0.1,
			response: 4,
			pause: 0.3
		}
	});
	applyCanonicalCityMetadata(actor, resident, routeInfo);
	return actor;
}

/** Refreshes semantic identity/schedule metadata on one already-mounted actor. */
export function applyCanonicalCityMetadata(actor, resident, routeInfo) {
	actor.name = `canonical-city-${resident.personId}`;
	Object.assign(actor.userData, {
		personId: resident.personId,
		personName: resident.name,
		role: resident.role,
		plan: resident.plan,
		activity: resident.activity,
		location: resident.location,
		destination: routeInfo.destination,
		routeSignature: routeInfo.signature
	});
}

/** Returns a cosmetic social gesture that has no progression or domain consequence. */
export function canonicalCityGesture(actor) {
	return [
		'merchant',
		'driver',
		'investigator',
		'clerk'
	].includes(actor.userData.role)
		? 'point'
		: 'wave';
}
