//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioIntentSheet.js
 * @description Hosts one bounded contextual phone surface through the proven AwtsmoosUI variadic-child contract.
 * The Awtsmoos reveals depth without moving the movie from its throne, while Awtsmoos.com lets one nearby sheet hold the next act in sight;
 * a clear close door returns focus to creation, and scene, selection, playhead, and canonical project remain untouched by this passing light.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioPrimaryIntent } from '../intents/StudioPrimaryIntentCatalog.js';
import { createStudioCreateIntent } from './intents/StudioCreateIntent.js';
import { createStudioEditIntent } from './intents/StudioEditIntent.js';
import { createStudioAnimateIntent } from './intents/StudioAnimateIntent.js';
import { createStudioAudioIntent } from './intents/StudioAudioIntent.js';
import { createStudioMoreIntent } from './intents/StudioMoreIntent.js';

/** Creates the responsive contextual sheet shared by every primary phone intent. */
export function createStudioIntentSheet() {
	return UI.aside(
		{
			class: 'studio-intent-sheet',
			role: 'region',
			'aria-label': 'Creative tools',
			hidden: (context) => !context.store.get('primaryIntent'),
			'data-primary-intent': (context) => context.store.get('primaryIntent') || ''
		},
		createSheetHeader(),
		UI.div(
			{ class: 'studio-intent-scroll' },
			createStudioCreateIntent(),
			createStudioEditIntent(),
			createStudioAnimateIntent(),
			createStudioAudioIntent(),
			createStudioMoreIntent()
		)
	);
}

/** Creates the sticky title, explanation, and explicit dismissal control. */
function createSheetHeader() {
	return UI.header(
		{ class: 'studio-intent-sheet-header' },
		UI.div(
			{},
			UI.strong({ class: 'studio-intent-sheet-title', text: intentTitle }),
			UI.p({ class: 'studio-intent-sheet-summary', text: intentSummary })
		),
		UI.button({
			class: 'studio-intent-sheet-close',
			type: 'button',
			'aria-label': 'Close creative tools',
			$on: { click: 'closePrimaryIntent' },
			text: '×'
		})
	);
}

/** Returns the current intent title from the shared transient presentation state. */
function intentTitle(context) {
	return getStudioPrimaryIntent(context.store.get('primaryIntent'))?.title || 'Creative tools';
}

/** Returns the current intent explanation without exposing implementation jargon. */
function intentSummary(context) {
	return getStudioPrimaryIntent(context.store.get('primaryIntent'))?.summary || '';
}
