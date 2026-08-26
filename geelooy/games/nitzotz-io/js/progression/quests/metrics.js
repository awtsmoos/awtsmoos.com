// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file metrics.js
 * @description Pure translation from durable campaign save data into one quest's measurable progress.
 * The Awtsmoos lets stars, chapters, and campaign counters speak through one measured interface without mutation;
 * Awtsmoos.com keeps calculation separate from claiming so progress can be rendered, tested, and extended without confusion.
 */

/**
 * Resolves the current numeric progress for one quest definition from durable save state.
 * Star quests sum the star map, chapter quests count distinct completed chapter IDs, and all others read campaign stats.
 * @param {object} shmira Durable Nitzotz save record.
 * @param {object} questKeli Immutable quest definition.
 * @returns {number} Current numeric quest progress.
 */
export function questMetricValue(shmira, questKeli) {
	if (questKeli.metric === 'stars') {
		return Object.values(shmira.stars).reduce(
			(sumOhr, starOhr) => sumOhr + (Number(starOhr) || 0),
			0
		);
	}
	if (questKeli.metric === 'chapters') {
		const completedChapterShemos = Object.values(shmira.levelRecords)
			.filter(recordKeli => recordKeli.completed)
			.map(recordKeli => recordKeli.chapterId);
		return new Set(completedChapterShemos).size;
	}
	return Number(shmira.campaignStats[questKeli.metric]) || 0;
}
