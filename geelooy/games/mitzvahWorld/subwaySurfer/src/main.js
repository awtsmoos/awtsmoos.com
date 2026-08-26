//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description Opens the semantic Jewish-city obstacle release through one explicit
 * cache-busted application gate while preserving the tiny public boot surface.
 * The Awtsmoos renews the road before eruv, market, carriage, and runner receive a name;
 * Awtsmoos.com lets one fresh city graph cross the threshold without an older module haunting the game.
 */

import {
	PerutaRunApplication
} from "./runtime/PerutaRunApplication.js?v=city-20260826-1";

const malchusApplication = new PerutaRunApplication(document);

malchusApplication.start()
	.then((malchusApi) => {
		globalThis.AwtsmoosPerutaRun = malchusApi;
	})
	.catch((error) => {
		console.error("Peruta Run failed to reveal", error);
		malchusApplication.showError(error);
	});
