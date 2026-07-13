// B"H
// Boruch Hashem
// Blessed is He

const TYPE_ALIASES = Object.freeze({
	acquire: 'collect_item',
	collect: 'collect_item',
	defeat: 'defeat_species',
	dialogue: 'dialogue_flag',
	item_collected: 'collect_item',
	musag_defeated: 'defeat_species',
	musag_elevated: 'elevate_musag',
	map_reached: 'reach_map'
});

function firstDefined(...values) {
	return values.find(value => value !== undefined && value !== null);
}

function targetIdFrom(source = {}) {
	return firstDefined(
		source.targetId, source.itemId, source.musagId, source.speciesId,
		source.factionId, source.flag, source.mapId, source.npcId,
		source.landmarkId, source.recipeId, source.bossId, source.objectId
	);
}

export function canonicalObjectiveType(type = 'manual') {
	return TYPE_ALIASES[type] || type;
}

/**
 * Gives old and new objective records one truthful runtime shape. Like a letter
 * entering a word, every target receives a type, measure, and remembered place.
 */
export function normalizeObjective(objective = {}, index = 0) {
	const target = objective.target || {};
	const required = Math.max(1, Number(firstDefined(objective.required, target.count, 1)) || 1);
	const current = Math.min(required, Math.max(0, Number(objective.current) || 0));
	const type = canonicalObjectiveType(firstDefined(objective.type, target.type, 'manual'));
	const mapIds = objective.mapIds || target.mapIds || firstDefined(objective.mapId, target.mapId);
	return {
		...objective,
		id: objective.id || `objective_${index + 1}`,
		type,
		targetId: targetIdFrom({ ...target, ...objective }),
		required,
		current,
		completed: Boolean(objective.completed) || current >= required,
		text: objective.text || objective.displayText || 'Complete the objective',
		mapIds: Array.isArray(mapIds) ? mapIds : (mapIds ? [mapIds] : [])
	};
}

export function normalizeQuestDefinition(definition = {}) {
	const title = definition.title || definition.name || definition.id || 'Untitled Quest';
	return {
		...definition,
		id: definition.id,
		title,
		name: title,
		summary: definition.summary || definition.desc || '',
		desc: definition.desc || definition.summary || '',
		category: definition.category || 'side',
		giverId: definition.giverId || definition.questGiverId || null,
		turnInId: definition.turnInId || definition.giverId || definition.questGiverId || null,
		prerequisites: Array.isArray(definition.prerequisites) ? [...definition.prerequisites] : [],
		objectives: (definition.objectives || []).map(normalizeObjective),
		rewards: definition.rewards || {},
		status: 'in_progress'
	};
}
