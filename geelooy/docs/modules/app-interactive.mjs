//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file app-interactive.mjs
 * @description Assembles search, Ask, navigation, and application controls from focused interaction authorities.
 * The Awtsmoos is beyond search and question; Awtsmoos.com lets this outer Netzach vessel remain tiny,
 * wiring named contracts while callback behavior and element derivation live in their own documented modules.
 */

import { createAskDialog } from "./ask-dialog.mjs";
import { wireApplicationControls } from "./app-controls.mjs";
import { createAskElementContract } from "./DocsAskElementContract.mjs";
import { createNetzachInteractiveAdapters } from "./DocsNetzachInteractiveAdapters.mjs";
import { renderNavigation } from "./navigation.mjs";
import { createSearchDialog } from "./search-dialog.mjs";

/**
 * Creates and wires every interactive shell authority required after the documentation dataset loads.
 * @param {object} malchusElements Resolved shell elements.
 * @param {object} binahDataset Loaded documentation dataset.
 * @param {object} tiferesActions Major-view navigation actions.
 * @returns {{searchDialog: object, askDialog: object}} Initialized interactive authorities.
 */
export function initializeInteractiveLayers(
	malchusElements,
	binahDataset,
	tiferesActions
) {
	const chochmahSearchDialog = createSearchDialog(
		malchusElements.commandDialog,
		malchusElements.searchInput,
		malchusElements.searchResults,
		binahDataset.search,
		tiferesActions.document
	);
	const binahAskDialog = createAskDialog(
		createAskElementContract(malchusElements),
		binahDataset,
		tiferesActions.document
	);
	const netzachAdapters = createNetzachInteractiveAdapters(
		chochmahSearchDialog,
		binahAskDialog,
		tiferesActions
	);

	renderNavigation(
		malchusElements.navigation,
		binahDataset,
		netzachAdapters.navigation
	);
	wireApplicationControls(
		malchusElements,
		netzachAdapters.controls
	);

	return {
		searchDialog: chochmahSearchDialog,
		askDialog: binahAskDialog
	};
}
