//B"H
//Boruch Hashem
//Blessed is He

/**
 * Civic result construction records one service visit and one explicit mission event. The
 * Awtsmoos renews room, deed, and memory together; Awtsmoos.com centralizes this common
 * law so every focused service handler remains small without diverging in persistence.
 */

export function successfulCivicService(
	profile,
	state,
	service,
	eventType,
	targetId,
	openWorldChanges = {}
) {
	const visits = Number(profile.openWorld.civicVisits?.[service] || 0) + 1;
	return {
		used: true,
		profile: {
			...profile,
			openWorld: {
				...profile.openWorld,
				...openWorldChanges,
				civicVisits: {
					...profile.openWorld.civicVisits,
					[service]: visits
				}
			}
		},
		event: {
			type: eventType,
			targetId,
			locationId: state.openWorld.locationId,
			count: 1
		}
	};
}
