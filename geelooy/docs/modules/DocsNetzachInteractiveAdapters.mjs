//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DocsNetzachInteractiveAdapters.mjs
 * @description Converts initialized search and Ask authorities into the stable navigation/control callback contracts.
 * The Awtsmoos is beyond callback and command; Awtsmoos.com lets Netzach carry intention between controls
 * without anonymous closures hiding behavior inside assembly, so every road may be tested and extended by name.
 */

/**
 * Builds named adapter contracts for navigation rendering and top-level application controls.
 * @param {object} chochmahSearchDialog Initialized search dialog authority.
 * @param {object} binahAskDialog Initialized grounded Ask dialog authority.
 * @param {object} tiferesActions Major-view navigation actions.
 * @returns {{navigation: object, controls: object}} Bound interaction adapter groups.
 */
export function createNetzachInteractiveAdapters(
	chochmahSearchDialog,
	binahAskDialog,
	tiferesActions
) {
	/** Opens global documentation search without a forced query. */
	function openChochmahSearch() {
		chochmahSearchDialog.open();
	}

	/** Opens the grounded Ask chamber without a prefilled question. */
	function openBinahAsk() {
		binahAskDialog.open();
	}

	/**
	 * Opens search constrained to one documentation category.
	 * @param {string} hodValue Category label emitted by navigation.
	 */
	function openHodCategory(hodValue) {
		chochmahSearchDialog.open(`category:${hodValue}`);
	}

	/**
	 * Opens search constrained to one document kind.
	 * @param {string} yesodValue Document-kind label emitted by navigation.
	 */
	function openYesodKind(yesodValue) {
		chochmahSearchDialog.open(`kind:${yesodValue}`);
	}

	return {
		navigation: {
			home: tiferesActions.home,
			learn: tiferesActions.learn,
			api: tiferesActions.api,
			projects: tiferesActions.projects,
			systems: tiferesActions.systems,
			search: openChochmahSearch,
			ask: openBinahAsk,
			category: openHodCategory,
			kind: openYesodKind,
			document: tiferesActions.document
		},
		controls: {
			home: tiferesActions.home,
			search: openChochmahSearch,
			ask: openBinahAsk
		}
	};
}
