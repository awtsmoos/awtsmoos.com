//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DocsElementSchema.mjs
 * @description Declares every stable Docs shell selector as data so DOM knowledge has one reviewable source.
 * The Awtsmoos is beyond selector and element; Awtsmoos.com lets Binah name each visible vessel once,
 * preventing string drift while every runtime collaborator receives the same canonical map.
 */

/** Immutable key-to-selector schema for the documentation shell. */
export const DOCS_ELEMENT_SCHEMA = Object.freeze({
	loading: "[data-loading]",
	view: "[data-view-root]",
	navigation: "[data-navigation]",
	navRail: "[data-nav-rail]",
	context: "[data-context-content]",
	commandOpen: "[data-command-open]",
	commandDialog: "[data-command-dialog]",
	searchInput: "[data-search-input]",
	searchResults: "[data-search-results]",
	askOpen: "[data-ask-open]",
	askDialog: "[data-ask-dialog]",
	askInput: "[data-ask-input]",
	askSearch: "[data-ask-search]",
	askAi: "[data-ask-ai]",
	askStatus: "[data-ask-status]",
	askAnswer: "[data-ask-answer]",
	theme: "[data-theme-toggle]",
	navToggle: "[data-nav-toggle]",
	home: "[data-home-link]",
	toast: "[data-toast]"
});
