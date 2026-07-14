//B"H
//Boruch Hashem
//Blessed is He

/**
 * Open-world defaults give every existing Expedition profile a safe lived-city body.
 * The Awtsmoos renews mission, technique, citizen, provision, and threshold together;
 * Awtsmoos.com begins with no hidden advantage and no mutation of competitive VS law.
 */

export function createBaseOpenWorldProfile() {
	return {
		missions: {},
		techniques: {
			punchRank: 1,
			kickRank: 1,
			mastery: {}
		},
		provisions: {
			meal: 0,
			tea: 0,
			map: 0,
			rumor: 0,
			passage: 0
		},
		knownDoors: [],
		lastStreetPositions: {},
		rumors: [],
		relationships: {},
		knownCitizens: [],
		dialogueFlags: [],
		discoveredShortcuts: [],
		patrols: {},
		civicVisits: {},
		encountersResolved: 0,
		rests: 0,
		civicTitle: 'New Shaliach'
	};
}

export function openWorldCivicTitle(openWorld) {
	const claimed = Object.values(openWorld.missions || {}).filter(
		mission => mission.status === 'claimed'
	).length;
	const known = Number(openWorld.knownCitizens?.length || 0);
	const techniqueSum =
		Number(openWorld.techniques?.punchRank || 1) + Number(openWorld.techniques?.kickRank || 1);
	if (claimed >= 8 && known >= 20 && techniqueSum >= 6) return 'Shaliach of the Living Road';
	if (claimed >= 5 || known >= 15) return 'Trusted Regional Shaliach';
	if (claimed >= 3 || known >= 8) return 'Trusted City Shaliach';
	if (claimed >= 1 || known >= 3) return 'Neighborhood Shaliach';
	return 'New Shaliach';
}
