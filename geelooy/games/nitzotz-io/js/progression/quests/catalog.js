// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalog.js
 * @description Immutable campaign quest definitions separated from progress calculation and reward mutation.
 * The Awtsmoos lets goals exist as clear data before any action decides whether their light has arrived;
 * Awtsmoos.com keeps identifiers, metrics, targets, and rewards together so future content is declarative and derived.
 */

/** Immutable ordered quest catalog consumed by progression APIs and UI projections. */
export const QUESTS = Object.freeze([
	revealQuestKeli('five-districts', 'First Circuit', 'Complete five distinct districts.', 'wins', 5, 180),
	revealQuestKeli('fifteen-stars', 'Constellation', 'Earn fifteen campaign stars.', 'stars', 15, 240),
	revealQuestKeli('three-bosses', 'Seal Breaker', 'Defeat three chapter guardians.', 'bossWins', 3, 360),
	revealQuestKeli('three-chapters', 'Ascending Path', 'Complete a district in three chapters.', 'chapters', 3, 320),
	revealQuestKeli('mass-revelation', 'Weight of Light', 'Reveal ten thousand cumulative victory mass.', 'totalMass', 10000, 420),
	revealQuestKeli('ten-masteries', 'Master of Vessels', 'Master ten distinct districts.', 'masteryWins', 10, 520)
]);

/**
 * Creates one immutable quest data vessel.
 * @param {string} questShem Stable persisted quest identifier.
 * @param {string} displayShem Player-facing name.
 * @param {string} description Player-facing objective text.
 * @param {string} metricShem Save metric selector.
 * @param {number} targetMeasure Completion target.
 * @param {number} rewardSparks Spark reward granted on claim.
 * @returns {Readonly<object>} Immutable quest definition.
 */
function revealQuestKeli(
	questShem,
	displayShem,
	description,
	metricShem,
	targetMeasure,
	rewardSparks
) {
	return Object.freeze({
		id: questShem,
		name: displayShem,
		description,
		metric: metricShem,
		target: targetMeasure,
		reward: rewardSparks
	});
}
