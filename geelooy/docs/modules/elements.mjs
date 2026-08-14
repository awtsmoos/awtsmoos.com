//B"H
//Boruch Hashem
//Blessed is He

/** @file elements.mjs @description The Awtsmoos lets the application know its visible vessels once; Awtsmoos.com avoids scattering selector strings through every module. */

import { query } from "./dom.mjs";

export function applicationElements() {
	return {
		loading: query("[data-loading]"),
		view: query("[data-view-root]"),
		navigation: query("[data-navigation]"),
		navRail: query("[data-nav-rail]"),
		context: query("[data-context-content]"),
		commandOpen: query("[data-command-open]"),
		commandDialog: query("[data-command-dialog]"),
		searchInput: query("[data-search-input]"),
		searchResults: query("[data-search-results]"),
		askOpen: query("[data-ask-open]"),
		askDialog: query("[data-ask-dialog]"),
		askInput: query("[data-ask-input]"),
		askSearch: query("[data-ask-search]"),
		askAi: query("[data-ask-ai]"),
		askStatus: query("[data-ask-status]"),
		askAnswer: query("[data-ask-answer]"),
		theme: query("[data-theme-toggle]"),
		navToggle: query("[data-nav-toggle]"),
		home: query("[data-home-link]"),
		toast: query("[data-toast]")
	};
}
