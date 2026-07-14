//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen builders preserve authored voice and service law in small immutable records.
 * The Awtsmoos renews each person beyond a menu label; Awtsmoos.com stores greeting,
 * quest, reputation, and cleared-region dialogue as explicit state-addressable speech.
 */

export function expeditionCitizen(config) {
	return Object.freeze({
		...config,
		dialogue: Object.freeze({ ...config.dialogue })
	});
}

export function citizen(
	id,
	locationId,
	name,
	role,
	service,
	questId,
	greeting,
	active,
	complete,
	cleared
) {
	return expeditionCitizen({
		id,
		locationId,
		name,
		role,
		service,
		questId,
		dialogue: { greeting, active, complete, cleared }
	});
}
