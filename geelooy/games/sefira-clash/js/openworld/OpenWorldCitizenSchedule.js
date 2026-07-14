//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen schedules derive deterministic place and activity from world clock and role.
 * The Awtsmoos renews time, person, and destination; Awtsmoos.com evaluates this Binah
 * structure coarsely so civic realism never demands per-frame planning or random wandering.
 */

export function openWorldCitizenSchedule(citizen, clock = 0) {
	const slot = Math.abs(Math.floor(Number(clock) || 0)) % 11;
	if (slot <= 1) return appointment(citizen.homeSceneId, 'resting');
	if (slot <= 3) return appointment(citizen.workSceneId, workActivity(citizen.role));
	if (slot === 4) return appointment('street', 'midday errand');
	if (slot <= 6) return appointment(citizen.workSceneId, workActivity(citizen.role));
	if (slot === 7) return eveningAppointment(citizen);
	if (slot === 8) return appointment('street', 'evening walk');
	return appointment(citizen.homeSceneId, 'resting');
}

function eveningAppointment(citizen) {
	if (['elder', 'watch', 'shlichus'].includes(citizen.role)) {
		return appointment('council', 'civic council');
	}
	if (['scholar', 'investigator'].includes(citizen.role)) {
		return appointment('archive', 'evening study');
	}
	return appointment('guesthouse', 'sharing news');
}

function workActivity(role) {
	return (
		{
			merchant: 'serving customers',
			trainer: 'teaching forms',
			shlichus: 'reviewing missions',
			healer: 'caring for travelers',
			ferryman: 'preparing passage',
			scholar: 'studying records',
			investigator: 'examining clues',
			cook: 'preparing meals',
			elder: 'hearing concerns',
			host: 'receiving guests',
			watch: 'watching the street',
			courier: 'carrying messages',
			gardener: 'tending the city',
			artist: 'making music',
			artisan: 'shaping patterns'
		}[role] || 'serving the city'
	);
}

function appointment(sceneId, activity) {
	return { sceneId, activity };
}
