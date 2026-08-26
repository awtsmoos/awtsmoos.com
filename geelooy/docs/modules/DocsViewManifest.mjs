//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DocsViewManifest.mjs
 * @description Declares major explorer renderers as named adapters so routing never becomes a growing conditional wall.
 * The Awtsmoos is beyond mode and renderer; Awtsmoos.com lets Binah map each major chamber to one clear
 * manifestation function, making future explorers additive while preserving the same visible stage contract.
 */

import { renderApiExplorer } from "./api-explorer-view.mjs";
import { renderLearning } from "./learning-view.mjs";
import { renderProjectExplorer } from "./project-explorer-view.mjs";
import { renderSystemExplorer } from "./system-explorer-view.mjs";

/**
 * Manifests the learning map through the common major-view signature.
 * @param {object} malchusElements Resolved shell elements.
 * @param {object} binahDataset Documentation dataset.
 * @param {object} tiferesState Current state, accepted for signature parity.
 * @param {object} netzachActions View actions.
 */
function revealChesedLearnView(
	malchusElements,
	binahDataset,
	tiferesState,
	netzachActions
) {
	void tiferesState;
	renderLearning(malchusElements.view, binahDataset, netzachActions);
}

/**
 * Manifests API Explorer through the common major-view signature.
 * @param {object} malchusElements Resolved shell elements.
 * @param {object} binahDataset Documentation dataset.
 * @param {object} tiferesState Current API explorer state.
 * @param {object} netzachActions View actions.
 */
function revealGevurahApiView(
	malchusElements,
	binahDataset,
	tiferesState,
	netzachActions
) {
	renderApiExplorer(
		malchusElements.view,
		binahDataset,
		tiferesState,
		netzachActions
	);
}

/**
 * Manifests Project Explorer through the common major-view signature.
 * @param {object} malchusElements Resolved shell elements.
 * @param {object} binahDataset Documentation dataset.
 * @param {object} tiferesState Current project explorer state.
 * @param {object} netzachActions View actions.
 */
function revealNetzachProjectsView(
	malchusElements,
	binahDataset,
	tiferesState,
	netzachActions
) {
	renderProjectExplorer(
		malchusElements.view,
		binahDataset,
		tiferesState,
		netzachActions
	);
}

/**
 * Manifests Systems Explorer through the common major-view signature.
 * @param {object} malchusElements Resolved shell elements.
 * @param {object} binahDataset Documentation dataset.
 * @param {object} tiferesState Current system explorer state.
 * @param {object} netzachActions View actions.
 */
function revealHodSystemsView(
	malchusElements,
	binahDataset,
	tiferesState,
	netzachActions
) {
	renderSystemExplorer(
		malchusElements.view,
		binahDataset,
		tiferesState,
		netzachActions
	);
}

/** Immutable major-view renderer manifest used by the application view router. */
export const DOCS_VIEW_MANIFEST = Object.freeze({
	learn: revealChesedLearnView,
	api: revealGevurahApiView,
	projects: revealNetzachProjectsView,
	systems: revealHodSystemsView
});
