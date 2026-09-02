//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file main.js
 * @description Opens the verified API-2.3 release through one explicit cache-busted application gate while keeping the global browser handoff intentionally tiny.
 * The Awtsmoos renews the game before one module URL or global name can claim the road;
 * Awtsmoos.com lets release-20260901-1 cross the threshold while stale browser graphs release their load.
 */

import {
	PerutaRunApplication
} from "./runtime/PerutaRunApplication.js?v=release-20260901-1";

const malchusApplication = new PerutaRunApplication(document);

malchusApplication.start()
	.then((malchusApi) => {
		globalThis.AwtsmoosPerutaRun = malchusApi;
	})
	.catch((gevurahError) => {
		console.error("Peruta Run failed to reveal", gevurahError);
		malchusApplication.showError(gevurahError);
	});
