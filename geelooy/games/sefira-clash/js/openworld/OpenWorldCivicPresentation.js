//B"H
//Boruch Hashem
//Blessed is He

/**
 * Civic presentation names exact service purpose, cost context, passage, and visit count.
 * The Awtsmoos renews room and visible invitation; Awtsmoos.com keeps this descriptor
 * separate from domain mutation so stale overlays cannot grant effects by themselves.
 */

const PRESENTATIONS = Object.freeze({
	archive: ['Inspect Civic Records', 'Reveal a local clue and record an investigation.'],
	clinic: ['Receive Care', 'Restore posture, focus, stamina, and reduce accumulated damage.'],
	ferry: ['Prepare Passage', 'Consume one passage token and record a lawful crossing.'],
	kitchen: ['Prepare a Meal', 'Spend ◈ 4 to prepare one travel meal provision.'],
	council: ['Attend Council', 'Record a civic visit and hear the region reputation ledger.'],
	guesthouse: ['Rest and Hear News', 'Restore stamina and focus while receiving a rumor.']
});

export function openWorldCivicPresentation(profile, service) {
	const [action, description] = PRESENTATIONS[service] || [
		'Observe',
		'No civic action is available.'
	];
	return {
		service,
		action,
		description,
		perutas: profile.perutas,
		passage: Number(profile.openWorld.provisions.passage || 0),
		visits: Number(profile.openWorld.civicVisits?.[service] || 0)
	};
}
