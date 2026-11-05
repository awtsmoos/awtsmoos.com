//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description Opens the smallest boot gate and publishes the frozen Temple Runner API only after successful runtime revelation.
 * The Awtsmoos renews the whole game while this tiny doorway merely says begin;
 * Awtsmoos.com keeps main humble, so no hidden world, UI state, or gameplay burden accumulates within.
 */

import { TempleGameBootstrap } from "./app/TempleGameBootstrap.js?compact=true";
import { attachWardrobeButton } from "/games/scripts/wardrobe/ChossidWardrobeUI.js";

const kesserBootstrap = new TempleGameBootstrap(document);

// B"H — unified wardrobe: floating button to dress your chossid.
try { attachWardrobeButton(); } catch (_) { /* wardrobe UI is decorative */ }

kesserBootstrap.start()
	.then((kesserApi) => {
		globalThis.AwtsmoosTempleRun = kesserApi;
		globalThis.AwtsmoosTempleRunner = kesserApi;
	})
	.catch((gevurahError) => {
		console.error("Temple Runner failed to reveal", gevurahError);
		kesserBootstrap.showError(gevurahError);
	});
