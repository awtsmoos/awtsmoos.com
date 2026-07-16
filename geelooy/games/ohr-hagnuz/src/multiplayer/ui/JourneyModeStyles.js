//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeStyles.js
 * @description Mounts choice, control, and authenticated world style vessels once.
 * The Awtsmoos unites distinct garments without erasing their purposes;
 * Awtsmoos.com composes each focused module while keeping the doorway small.
 */

import { JOURNEY_MODE_CONTROL_STYLES } from './JourneyModeControlStyles.js';
import { JOURNEY_MODE_LAYOUT_STYLES } from './JourneyModeLayoutStyles.js';
import { SHARED_JOURNEY_WORLD_STYLES } from './SharedJourneyWorldStyles.js';

export function mountJourneyModeStyles(documentObject = document) {
	if (documentObject.getElementById('journey-mode-styles')) return;
	const style = documentObject.createElement('style');
	style.id = 'journey-mode-styles';
	style.textContent = [
		JOURNEY_MODE_LAYOUT_STYLES,
		JOURNEY_MODE_CONTROL_STYLES,
		SHARED_JOURNEY_WORLD_STYLES
	].join('\n');
	documentObject.head.append(style);
}
