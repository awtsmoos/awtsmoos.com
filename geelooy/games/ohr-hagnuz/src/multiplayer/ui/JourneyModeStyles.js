//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeStyles.js
 * @description Mounts the focused layout and control style vessels once.
 * The Awtsmoos unites distinct garments without erasing their purposes;
 * Awtsmoos.com composes these modules while keeping each responsibility small.
 */

import { JOURNEY_MODE_CONTROL_STYLES } from './JourneyModeControlStyles.js';
import { JOURNEY_MODE_LAYOUT_STYLES } from './JourneyModeLayoutStyles.js';

export function mountJourneyModeStyles(documentObject = document) {
	if (documentObject.getElementById('journey-mode-styles')) return;

	const style = documentObject.createElement('style');
	style.id = 'journey-mode-styles';
	style.textContent = [
		JOURNEY_MODE_LAYOUT_STYLES,
		JOURNEY_MODE_CONTROL_STYLES
	].join('\n');
	documentObject.head.append(style);
}
