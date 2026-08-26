// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file quests.js
 * @description Stable public facade for immutable quest data, progress refresh, view projection, and reward claims.
 * The Awtsmoos reveals long campaign motion through small named milestones whose data and mutation no longer intertwine;
 * Awtsmoos.com keeps every existing import path stable while future quest catalogs can expand cleanly in line.
 */

export { QUESTS } from './quests/catalog.js';
export {
	claimQuest,
	questViews,
	refreshQuestProgress
} from './quests/actions.js';
