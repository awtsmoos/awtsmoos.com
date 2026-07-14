// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds traversable campaign prototypes without fake completion props.
 * @description The Awtsmoos gives a road existence before every future deed is
 * authored upon it. Awtsmoos.com may preserve geography, residents, ecology,
 * and return routes, but no object here may impersonate an unimplemented act.
 */

const BASE_ROWS = Object.freeze([
	'🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱',
	'🧱▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🧱',
	'🧱▫️🌿▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🌿▫️▫️🧱',
	'🧱▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🧱',
	'🧱▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🧱',
	'🧱▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🧱',
	'🧱▫️🌿▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🌿▫️▫️🧱',
	'🧱▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🧱',
	'🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱'
]);

function door(id, x, y, targetMap, targetX, targetY, visual) {
	return {
		id,
		type: 'door',
		x,
		y,
		targetMap,
		targetX,
		targetY,
		visual
	};
}

function resident(definition, x, y) {
	return {
		id: definition.id,
		type: 'npc',
		name: definition.name,
		x,
		y,
		visual: definition.visual,
		dialogue: definition.line,
		questGiver: null
	};
}

function addDoors(interactables, entry) {
	interactables.return_path = door(
		`${entry.id}_return`,
		1,
		7,
		entry.previous,
		2,
		2,
		'⬅️'
	);

	if (!entry.next) {
		return;
	}

	interactables.forward_path = door(
		`${entry.id}_forward`,
		15,
		1,
		entry.next,
		2,
		6,
		'➡️'
	);
}

function addResidents(interactables, entry) {
	const residents = entry.npcs || [];
	const first = residents[(entry.index * 2) % residents.length];
	const second = residents[((entry.index * 2) + 1) % residents.length];

	if (first) {
		interactables.region_keeper = resident(first, 5, 4);
	}

	if (second) {
		interactables.region_witness = resident(second, 11, 5);
	}
}

/** Builds one prototype map from the enriched regional entry contract. */
export function createCampaignMap(entry) {
	const interactables = {};
	addDoors(interactables, entry);
	addResidents(interactables, entry);

	return {
		id: entry.id,
		name: entry.name,
		width: 17,
		height: 9,
		baseLayerString: BASE_ROWS.join('\n'),
		interactables,
		encounters: entry.encounters,
		theme: {
			ground: entry.theme.ground,
			accent: entry.theme.accent,
			border: entry.theme.border,
			regionId: entry.regionId,
			prototype: true
		}
	};
}
