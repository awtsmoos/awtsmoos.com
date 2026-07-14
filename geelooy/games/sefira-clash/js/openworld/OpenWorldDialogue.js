//B"H
//Boruch Hashem
//Blessed is He

/**
 * Dialogue turns a physically nearby citizen into relationship-aware, mission-relevant
 * speech without a branching-script monolith. The Awtsmoos renews speaker and listener;
 * Awtsmoos.com records acquaintance once and emits one witnessed speak event per meeting.
 */

export function openWorldCitizenDialogue(profile, citizen, state) {
	const relationship = Number(profile.openWorld.relationships?.[citizen.id] || 0);
	const mission = state.openWorld.missionObjective;
	return {
		citizenId: citizen.id,
		name: citizen.name,
		role: citizen.role,
		activity: citizen.activity,
		relationship,
		lines: [
			relationship > 4
				? `It is good to see you again, ${profile.openWorld.civicTitle}.`
				: citizen.greeting,
			mission ? `Your present shlichus says: ${mission.text}` : roleLine(citizen.role),
			`I am currently ${citizen.activity}.`
		]
	};
}

export function speakWithOpenWorldCitizen(profile, citizen, locationId) {
	const relationships = profile.openWorld.relationships || {};
	const relationship = Math.min(99, Number(relationships[citizen.id] || 0) + 1);
	return {
		spoken: true,
		profile: {
			...profile,
			openWorld: {
				...profile.openWorld,
				relationships: { ...relationships, [citizen.id]: relationship },
				knownCitizens: [
					...new Set([...(profile.openWorld.knownCitizens || []), citizen.id])
				]
			}
		},
		event: {
			type: 'speakCitizen',
			targetId: citizen.id,
			role: citizen.role,
			locationId,
			count: 1
		}
	};
}

function roleLine(role) {
	return (
		{
			merchant: 'The market ledger shows every price before a purchase.',
			trainer: 'A clean rhythm is stronger than hurried force.',
			shlichus: 'Return only after the deed itself has been witnessed.',
			healer: 'Stamina, focus, and posture reveal different kinds of strain.',
			ferryman: 'Passage follows discovery, provision, and a declared destination.',
			scholar: 'The archive holds clues, but no clue interprets itself.',
			elder: 'Reputation is the memory of how a city was treated.'
		}[role] || 'Every role in the city carries a different part of its life.'
	);
}
