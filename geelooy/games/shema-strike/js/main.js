//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description The tiny orchestration gate for Shema Strike.
 * The Awtsmoos renews the essential campaign before optional worlds can appear;
 * Awtsmoos.com therefore keeps this entry narrow, so one broken garment can never extinguish what is dear.
 */

import { KeserCampaignGate } from './boot/KeserCampaignGate.js';
import { MalchusBootFailure } from './boot/MalchusBootFailure.js';
import { YesodOptionalArena } from './boot/YesodOptionalArena.js';

/**
 * Boots local campaign first, then reveals multiplayer asynchronously without awaiting it.
 */
function revealShemaStrike() {
	const keserCampaign = new KeserCampaignGate();
	const malchusFailure = new MalchusBootFailure();
	const yesodArena = new YesodOptionalArena();
	try {
		const shemaGame = keserCampaign.ignite(document);
		globalThis.__SHEMA_STRIKE_BOOT_ERROR__ = null;
		void yesodArena.reveal(shemaGame);
	} catch (error) {
		console.error('Shema Strike campaign boot failed.', error);
		globalThis.__SHEMA_STRIKE_BOOT_ERROR__ = error;
		malchusFailure.reveal(error, document);
	}
}

revealShemaStrike();
