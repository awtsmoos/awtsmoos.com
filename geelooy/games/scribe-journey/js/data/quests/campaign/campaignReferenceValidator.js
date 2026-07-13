// B"H
// Boruch Hashem
// Blessed is He

const ITEM_TYPES = new Set(['collect_item', 'gather_node', 'craft_item', 'use_item', 'donate_item', 'equip_item', 'store_item']);
const CREATURE_TYPES = new Set(['defeat_species', 'battle_species', 'calm_species', 'recruit_musag', 'elevate_musag', 'defeat_boss', 'resolve_boss', 'defeat_elite']);
const ABSTRACT_CREATURES = new Set(['starter_musag', 'party_musag', 'displaced_musag', 'trapped_musag', 'flooded_musag']);

function objectiveErrors(quest, objective, registries) {
	const errors = [];
	const warnings = [];
	if (!objective.id || !objective.type || !objective.text) errors.push(`${quest.id} has an incomplete objective definition.`);
	if (!Number.isFinite(Number(objective.required)) || Number(objective.required) < 1) errors.push(`${quest.id}/${objective.id} has invalid required count.`);
	const mapIds = objective.mapIds || (objective.mapId ? [objective.mapId] : []);
	for (const mapId of mapIds) if (!registries.maps[mapId]) errors.push(`${quest.id}/${objective.id} references missing map ${mapId}.`);
	if (objective.type === 'reach_map' && !registries.maps[objective.targetId]) errors.push(`${quest.id}/${objective.id} targets missing map ${objective.targetId}.`);
	if (ITEM_TYPES.has(objective.type) && !registries.items[objective.targetId]) warnings.push(`${quest.id}/${objective.id} references abstract or missing item ${objective.targetId}.`);
	if (CREATURE_TYPES.has(objective.type) && !ABSTRACT_CREATURES.has(objective.targetId) && !registries.musagim[objective.targetId]) {
		warnings.push(`${quest.id}/${objective.id} references abstract or missing Musag ${objective.targetId}.`);
	}
	return { errors, warnings };
}

function rewardErrors(quest, registries) {
	const errors = [];
	for (const reward of quest.rewards?.items || []) {
		const itemId = typeof reward === 'string' ? reward : reward.itemId;
		if (!registries.items[itemId]) errors.push(`${quest.id} rewards missing item ${itemId}.`);
	}
	for (const change of quest.mapChanges || quest.rewards?.mapChanges || []) {
		if (!registries.maps[change.mapId]) errors.push(`${quest.id} changes missing map ${change.mapId}.`);
	}
	return errors;
}

/** Separates fatal broken references from explicit abstract objective vocabulary. */
export function validateCampaignReferences(quests, registries) {
	const errors = [];
	const warnings = [];
	for (const quest of Object.values(quests)) {
		if (!quest.id || !quest.title || !quest.regionId || !quest.giverId) errors.push(`${quest.id || 'unknown'} lacks required quest metadata.`);
		if (!Array.isArray(quest.objectives) || !quest.objectives.length) errors.push(`${quest.id} has no objectives.`);
		for (const objective of quest.objectives || []) {
			const result = objectiveErrors(quest, objective, registries);
			errors.push(...result.errors);
			warnings.push(...result.warnings);
		}
		errors.push(...rewardErrors(quest, registries));
	}
	return { errors, warnings };
}
