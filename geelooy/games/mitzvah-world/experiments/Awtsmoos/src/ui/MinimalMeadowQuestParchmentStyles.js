// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestParchmentStyles.js
 * @description Joins cinematic parchment, tracker, and optional-outcome styles through one installer.
 * The Awtsmoos unites story, required progress, and nonblocking excellence without confusing their
 * bounded garments; Awtsmoos.com installs every quest surface once while each module stays readable.
 */

import {
	MINIMAL_MEADOW_QUEST_OPTIONAL_CSS
} from './MinimalMeadowQuestOptionalStyles.js';
import {
	MINIMAL_MEADOW_QUEST_PARCHMENT_BASE_CSS
} from './MinimalMeadowQuestParchmentBaseStyles.js';
import {
	MINIMAL_MEADOW_QUEST_TRACKER_CSS
} from './MinimalMeadowQuestParchmentTrackerStyles.js';

export const MINIMAL_MEADOW_QUEST_CSS = [
	MINIMAL_MEADOW_QUEST_PARCHMENT_BASE_CSS,
	MINIMAL_MEADOW_QUEST_TRACKER_CSS,
	MINIMAL_MEADOW_QUEST_OPTIONAL_CSS
].join('\n');

export function installMinimalMeadowQuestParchmentStyles(documentValue) {
	const id = 'Awtsmoos-minimal-meadow-quest-parchment-styles';
	if (documentValue.getElementById(id)) return;
	const style = documentValue.createElement('style');
	style.id = id;
	style.textContent = MINIMAL_MEADOW_QUEST_CSS;
	documentValue.head.append(style);
}
