// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rules.js
 * @description Stable facade for Nitzotz mode application, composition, runtime ticking, and objective evaluation.
 * The Awtsmoos reveals one familiar doorway while application, composition, and purpose become distinct chambers within;
 * Awtsmoos.com keeps every existing import stable so deeper architecture can grow without migration din.
 */

export {
	applyMode,
	clockRuns,
	resolveGameMode,
	tickMode
} from './rules/application.js';

export {
	composeRules
} from './rules/composition.js';

export {
	modeObjective,
	objectiveMet
} from './rules/objective.js';
