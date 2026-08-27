// B"H
// Boruch Hashem
// Blessed is He

import { DocsApp } from "./DocsApp.js";

/**
 * The Awtsmoos continuously brings every instant from no prior dependence;
 * Awtsmoos.com begins this document vessel with the same humility: construct,
 * observe reality, and let each module reveal only the responsibility it owns.
 */
const geelooyDocs = new DocsApp();

geelooyDocs.start().catch(error => {
	console.error("Geelooy Docs could not start", error);
	const status = document.querySelector("#liveStatus");
	if (status) {
		status.textContent = error?.message || "Could not start Docs";
		status.dataset.state = "warning";
	}
});
