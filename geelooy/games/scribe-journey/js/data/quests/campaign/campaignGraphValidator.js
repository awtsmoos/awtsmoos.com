// B"H
// Boruch Hashem
// Blessed is He

function prerequisiteErrors(quests) {
	const errors = [];
	for (const quest of Object.values(quests)) {
		if (quest.id !== Object.keys(quests).find(key => quests[key] === quest)) {
			errors.push(`Registry key does not match quest id ${quest.id}.`);
		}
		for (const prerequisite of quest.prerequisites || []) {
			if (!quests[prerequisite]) errors.push(`${quest.id} requires missing quest ${prerequisite}.`);
		}
	}
	return errors;
}

function cycleErrors(quests) {
	const errors = [];
	const visiting = new Set();
	const visited = new Set();
	function visit(questId, path) {
		if (visiting.has(questId)) {
			errors.push(`Circular prerequisite: ${[...path, questId].join(' -> ')}`);
			return;
		}
		if (visited.has(questId) || !quests[questId]) return;
		visiting.add(questId);
		for (const prerequisite of quests[questId].prerequisites || []) visit(prerequisite, [...path, questId]);
		visiting.delete(questId);
		visited.add(questId);
	}
	for (const questId of Object.keys(quests)) visit(questId, []);
	return errors;
}

function unreachableErrors(quests) {
	const reached = new Set(Object.values(quests).filter(quest => !(quest.prerequisites || []).length).map(quest => quest.id));
	let changed = true;
	while (changed) {
		changed = false;
		for (const quest of Object.values(quests)) {
			if (reached.has(quest.id)) continue;
			if ((quest.prerequisites || []).every(id => reached.has(id))) {
				reached.add(quest.id);
				changed = true;
			}
		}
	}
	return Object.keys(quests).filter(id => !reached.has(id)).map(id => `Unreachable quest ${id}.`);
}

/** Proves the authored quest graph has roots, valid edges, and no circles. */
export function validateCampaignGraph(quests) {
	return [...prerequisiteErrors(quests), ...cycleErrors(quests), ...unreachableErrors(quests)];
}
