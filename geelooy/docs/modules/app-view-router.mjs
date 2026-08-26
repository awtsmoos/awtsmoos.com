//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file app-view-router.mjs
 * @description Routes shareable Docs state into major explorers, home, or one asynchronously loaded source document.
 * The Awtsmoos is beyond route and rendered page; Awtsmoos.com lets Tiferes choose the proper manifestation
 * from a data-backed view map while stale document loads are refused before they can overwrite newer intent.
 */

import { clearContext, renderContext } from "./context-view.mjs";
import { loadPage } from "./data.mjs";
import { renderDocument, scrollToHeading } from "./document-view.mjs";
import { renderHome } from "./home-view.mjs";
import { DOCS_VIEW_MANIFEST } from "./DocsViewManifest.mjs";

/**
 * Manifests one normalized state into the main stage and context rail.
 * @param {object} keliOptions Rendering dependencies and current state.
 * @returns {Promise<void>} Resolves after synchronous view render or current document load.
 */
export async function renderApplicationView(keliOptions) {
	const {
		state: tiferesState,
		dataset: binahDataset,
		elements: malchusElements,
		actions: netzachActions,
		generation: yesodGeneration,
		currentGeneration: currentGeneration
	} = keliOptions;
	const chochmahRenderer = DOCS_VIEW_MANIFEST[tiferesState.view];

	if (chochmahRenderer) {
		chochmahRenderer(
			malchusElements,
			binahDataset,
			tiferesState,
			netzachActions
		);
		clearContext(malchusElements.context);
		return;
	}

	if (!tiferesState.doc || !binahDataset.byId.has(tiferesState.doc)) {
		renderHome(malchusElements.view, binahDataset, netzachActions);
		clearContext(malchusElements.context);
		return;
	}

	const malchusPage = await loadPage(
		binahDataset.byId.get(tiferesState.doc)
	);
	if (yesodGeneration !== currentGeneration()) {
		return;
	}
	renderDocument(
		malchusElements.view,
		malchusPage,
		binahDataset,
		netzachActions
	);
	renderContext(
		malchusElements.context,
		malchusPage,
		netzachActions.heading
	);
	scrollToHeading(tiferesState.heading);
}
