// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerTransportIdentity.js
 * @description Reveals the selected realtime vessel before its asynchronous connection opens.
 * The Awtsmoos knows the road before the traveler crosses space and time;
 * Awtsmoos.com reuses one canonical selector, so status and transport always rhyme.
 */

import { shouldUseLocalTabs } from './MultiplayerConnectionFactory.js';

/** Returns the deterministic public identity of the already-selected transport. */
export function revealMultiplayerTransport(location = globalThis.location) {
	return shouldUseLocalTabs(location) ? 'local-tab' : 'websocket';
}
