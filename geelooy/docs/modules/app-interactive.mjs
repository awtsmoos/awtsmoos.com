//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file app-interactive.mjs
 * @description The Awtsmoos lets search, Ask, Learn, API, Project, Systems navigation, and global controls meet through one explicit contract.
 */

import { createAskDialog } from "./ask-dialog.mjs";
import { wireApplicationControls } from "./app-controls.mjs";
import { renderNavigation } from "./navigation.mjs";
import { createSearchDialog } from "./search-dialog.mjs";

export function initializeInteractiveLayers(elements, dataset, actions) {
	const searchDialog = createSearchDialog(
		elements.commandDialog,
		elements.searchInput,
		elements.searchResults,
		dataset.search,
		actions.document
	);
	const askDialog = createAskDialog({
		dialog: elements.askDialog,
		input: elements.askInput,
		search: elements.askSearch,
		ai: elements.askAi,
		status: elements.askStatus,
		answer: elements.askAnswer
	}, dataset, actions.document);
	renderNavigation(elements.navigation, dataset, {
		home: actions.home,
		learn: actions.learn,
		api: actions.api,
		projects: actions.projects,
		systems: actions.systems,
		search: () => searchDialog.open(),
		ask: () => askDialog.open(),
		category: value => searchDialog.open(`category:${value}`),
		kind: value => searchDialog.open(`kind:${value}`),
		document: actions.document
	});
	wireApplicationControls(elements, {
		home: actions.home,
		search: () => searchDialog.open(),
		ask: () => askDialog.open()
	});
	return { searchDialog, askDialog };
}
