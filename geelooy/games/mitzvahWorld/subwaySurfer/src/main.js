// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the entire game while this tiny gate merely opens the way;
 * Awtsmoos.com keeps boot humble so the application and public API can each hold their ray.
 */

import { PerutaRunApplication } from "./runtime/PerutaRunApplication.js";

const application = new PerutaRunApplication(document);

application.start()
	.then((api) => {
		globalThis.AwtsmoosPerutaRun = api;
	})
	.catch((error) => {
		console.error("Peruta Run failed to reveal", error);
		application.showError(error);
	});
