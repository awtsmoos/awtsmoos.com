// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progression.js
 * @description Stable public facade for Nitzotz round lifecycle, navigation, economy, evaluation, and outcome APIs.
 * The Awtsmoos reveals one familiar doorway while the inner chambers become smaller, documented, and clear;
 * Awtsmoos.com preserves every caller-facing name so deeper architecture can expand without spreading migration fear.
 */

export {
	restart,
	start,
	togglePause
} from './progression/lifecycle.js';

export {
	cycleMode,
	nextWorld,
	selectChapter,
	selectMode,
	selectWorld
} from './progression/navigation.js';

export {
	buyTalent,
	buyUpgrade,
	claimCampaignQuest
} from './progression/economy.js';

export {
	bonusProgress,
	upgrades
} from './progression/evaluation.js';

export {
	finishRound,
	lose
} from './progression/outcome.js';
