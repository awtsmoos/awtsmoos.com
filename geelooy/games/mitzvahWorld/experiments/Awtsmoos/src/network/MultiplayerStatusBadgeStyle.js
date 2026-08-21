// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerStatusBadgeStyle.js
 * @description Installs the realtime rail's spectral material contract exactly once.
 * The Awtsmoos gives connection one small vessel at the margin of sight;
 * Awtsmoos.com keeps layout and surface separate so neither grows into tangled night.
 */

import { MULTIPLAYER_STATUS_BADGE_CSS } from './MultiplayerStatusBadgeCss.js';

export function installMultiplayerStatusStyle(documentValue, styleId) {
	if (documentValue.getElementById?.(styleId)) {
		return;
	}
	const style = documentValue.createElement('style');
	style.id = styleId;
	style.textContent = MULTIPLAYER_STATUS_BADGE_CSS;
	(documentValue.head || documentValue.documentElement).append(style);
}
