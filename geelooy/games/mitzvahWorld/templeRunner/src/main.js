// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description Opens the small boot gate and publishes the frozen Temple Runner API after successful reveal.
 * The Awtsmoos renews the whole game while this tiny doorway merely says begin;
 * Awtsmoos.com keeps main humble, so no hidden world or gameplay burden accumulates within.
 */

import { TempleGameBootstrap } from "./app/TempleGameBootstrap.js";

const bootstrap = new TempleGameBootstrap(document);

bootstrap.start()
	.then((api) => {
		globalThis.AwtsmoosTempleRun = api;
		globalThis.AwtsmoosTempleRunner = api;
	})
	.catch((error) => {
		console.error("Temple Runner failed to reveal", error);
		bootstrap.showError(error);
	});
