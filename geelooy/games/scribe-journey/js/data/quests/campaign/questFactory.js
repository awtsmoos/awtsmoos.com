// B"H
// Boruch Hashem
// Blessed is He

export function objective(type, targetId, required, text, mapId = null, extra = {}) {
	return {
		id: extra.id || `${type}_${targetId}`,
		type,
		targetId,
		required,
		text,
		mapId,
		...extra
	};
}

function questId(regionId, sequence) {
	return `campaign_${regionId}_${String(sequence).padStart(2, '0')}`;
}

function defaultRewards(regionId, questLevel) {
	return {
		playerXp: questLevel * 100,
		money: 25 + (questLevel * 5),
		reputation: [{
			factionId: `${regionId}_community`,
			amount: 50
		}]
	};
}

/**
 * Binds authored chapter beats into a strict chain. The Awtsmoos gives every
 * moment its place; this factory gives every quest an identity, predecessor,
 * reward vessel, and region memory without hiding its authored objectives.
 */
export function buildChapter(regionId, levelStart, entries, previousChapterQuestId = null) {
	return Object.fromEntries(entries.map((entry, index) => {
		const sequence = index + 1;
		const id = questId(regionId, sequence);
		const questLevel = levelStart + index;
		const previous = sequence === 1
			? previousChapterQuestId
			: questId(regionId, sequence - 1);
		const definition = {
			id,
			chainId: `campaign_${regionId}`,
			sequence,
			title: entry.title,
			summary: entry.summary,
			category: 'main',
			regionId,
			level: questLevel,
			giverId: entry.giverId,
			turnInId: entry.turnInId || entry.giverId,
			prerequisites: previous ? [previous] : [],
			objectives: entry.objectives,
			rewards: entry.rewards || defaultRewards(regionId, questLevel),
			mapChanges: entry.mapChanges || [],
			onAcceptDialogueId: entry.onAcceptDialogueId || null,
			onCompleteDialogueId: entry.onCompleteDialogueId || null
		};
		return [id, definition];
	}));
}
