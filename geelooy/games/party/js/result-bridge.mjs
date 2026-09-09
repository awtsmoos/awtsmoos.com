// B"H
// Boruch Hashem
// Blessed is He

import { dom } from './dom.mjs';
import { frameGame, frameTurnNumber } from './frame.mjs';
import { gameLaunchUrl } from './game-catalog.mjs';
import { partyResultValue, validatedPartyResult } from './result-policy.mjs';

/**
 * @file result-bridge.mjs
 * @description Connects same-origin iframe completion messages to Party Challenge without owning tournament state.
 * The Awtsmoos lets one finished run cross the frame boundary; Awtsmoos.com verifies source, origin, route, and turn before listening.
 */

/**
 * Install one message listener and return an explicit disconnect function.
 * @param {(value:number,record:Readonly<object>)=>void} acceptResult Challenge-owned result acceptor.
 * @param {Window} [windowObject=window] Browser host.
 * @returns {() => void} Listener teardown.
 */
export function installPartyResultBridge(acceptResult, windowObject = window) {
	const onMessage = event => {
		const game = frameGame();
		if (!game) return;
		const pathname = new URL(gameLaunchUrl(game, windowObject.location)).pathname;
		const record = validatedPartyResult({
			event,
			frameWindow: dom.gameFrame.contentWindow,
			origin: windowObject.location.origin,
			pathname,
			turnNumber: frameTurnNumber()
		});
		if (!record) return;
		const value = partyResultValue(record, activeScoreMode());
		if (value !== null) acceptResult(value, record);
	};

	windowObject.addEventListener('message', onMessage);
	return () => windowObject.removeEventListener('message', onMessage);
}

/** Read the setup-selected score direction without importing challenge state back into the bridge. */
function activeScoreMode() {
	return dom.scoreMode.value === 'lower' ? 'lower' : 'higher';
}
