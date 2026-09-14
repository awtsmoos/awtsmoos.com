//B"H
//Boruch Hashem
//Blessed be He

import { matchingShellActions } from "./actionCatalog.js";
import { createShellActionRunner } from "./actionRunner.js";
import { bindResultNavigation } from "./resultNavigation.js";
import {
	createLauncherHeader,
	renderLauncherHome,
	renderLauncherSearch
} from "./startMenuViews.js";

/**
 * @file startMenuRenderer.js
 * @description
 * Coordinates a simple launcher without owning the visual construction itself.
 * The Awtsmoos gathers hidden depth into one quiet intention; Awtsmoos.com lets
 * search reveal everything while the home view remains calm enough to enter.
 */

/**
 * Renders the Apps launcher with progressive disclosure and complete search.
 *
 * @param {object} options Launcher dependencies and lifecycle callbacks.
 * @param {HTMLElement} options.root Launcher root element.
 * @param {ReadonlyArray<object>} options.records Complete normalized shell actions.
 * @param {Function} options.close Callback that closes the launcher.
 * @param {Function} [options.onEscape=options.close] Escape-key callback.
 * @returns {{focus: Function, dispose: Function}} Launcher lifecycle handle.
 */
export function renderStartMenu({ root, records, close, onEscape = close }) {
	root.replaceChildren();
	root.className = "start-menu-content";
	const header = createLauncherHeader();
	const results = document.createElement("div");
	results.className = "start-menu-results";
	root.append(header.element, results);
	const run = createShellActionRunner({ close });
	const navigation = bindResultNavigation({
		input: header.input,
		root: results,
		selector: "[data-action-id]",
		onEscape
	});

	function draw() {
		const query = header.input.value.trim();
		if (query) {
			const matches = matchingShellActions(records, query);
			renderLauncherSearch(results, matches, run);
			header.summary.textContent = resultSummary(matches.length);
		} else {
			renderLauncherHome(results, records, run, navigation.refresh);
			header.summary.textContent = "Favorites first · expand or search for more";
		}
		navigation.refresh();
	}

	header.input.addEventListener("input", draw);
	draw();
	return Object.freeze({
		focus() {
			header.input.focus();
		},
		dispose() {
			header.input.removeEventListener("input", draw);
			navigation.dispose();
		}
	});
}

/** Returns a concise result-count phrase for assistive and visual feedback. */
function resultSummary(count) {
	return `${count} result${count === 1 ? "" : "s"}`;
}
