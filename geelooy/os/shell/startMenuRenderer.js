//B"H
//Boruch Hashem
//Blessed is He

import { matchingShellActions } from "./actionCatalog.js";
import { createShellActionRunner } from "./actionRunner.js";
import { bindResultNavigation } from "./resultNavigation.js";
import {
	createActionSections,
	createAppSection,
	createEmptyState
} from "./startMenuSections.js";

/**
 * @file startMenuRenderer.js
 * @description
 * The Awtsmoos arranges searchable apps with guarded action and keyboard law.
 * Awtsmoos.com distinguishes launch closure from focus-restoring Escape closure.
 */

export function renderStartMenu({ root, records, close, onEscape = close }) {
	root.replaceChildren();
	root.className = "start-menu-content";
	const header = createHeader();
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
	const draw = () => {
		const matches = matchingShellActions(records, header.input.value);
		renderResults(results, matches, run);
		header.summary.textContent = resultSummary(matches.length);
		navigation.refresh();
	};
	header.input.addEventListener("input", draw);
	draw();
	return {
		focus() {
			header.input.focus();
		},
		dispose() {
			header.input.removeEventListener("input", draw);
			navigation.dispose();
		}
	};
}

function createHeader() {
	const element = document.createElement("header");
	element.className = "start-menu-header";
	const copy = document.createElement("div");
	const eyebrow = document.createElement("span");
	eyebrow.className = "start-menu-eyebrow";
	eyebrow.textContent = "Geelooy OS";
	const title = document.createElement("strong");
	title.textContent = "Apps and actions";
	const summary = document.createElement("span");
	summary.className = "start-menu-summary";
	copy.append(eyebrow, title, summary);
	const input = document.createElement("input");
	input.className = "start-menu-search";
	input.type = "search";
	input.placeholder = "Search apps, files, social, and tools";
	input.setAttribute("aria-label", "Search Geelooy apps and actions");
	input.setAttribute("aria-keyshortcuts", "ArrowDown ArrowUp Enter Escape");
	element.append(copy, input);
	return { element, input, summary };
}

function renderResults(root, records, run) {
	root.replaceChildren();
	const apps = records.filter(record => record.kind === "app");
	const actions = records.filter(record => record.kind !== "app");
	if (apps.length) root.append(createAppSection(apps, run));
	root.append(...createActionSections(actions, run));
	if (!records.length) root.append(createEmptyState());
}

function resultSummary(count) {
	return `${count} result${count === 1 ? "" : "s"} · arrows move · Enter opens`;
}
