//B"H
//Boruch Hashem
//Blessed is He

import { matchingShellActions } from "./actionCatalog.js";
import {
	createActionSections,
	createAppSection,
	createEmptyState
} from "./startMenuSections.js";

/**
 * @file startMenuRenderer.js
 * @description
 * The Awtsmoos arranges apps and deeds without flattening their meaning.
 * Awtsmoos.com renders a searchable launcher from real action records only.
 */

export function renderStartMenu({ root, records, close }) {
	root.replaceChildren();
	root.className = "start-menu-content";
	const header = createHeader();
	const results = document.createElement("div");
	results.className = "start-menu-results";
	root.append(header.element, results);
	const draw = () => renderResults(
		results,
		matchingShellActions(records, header.input.value),
		close
	);
	header.input.addEventListener("input", draw);
	draw();
	return {
		focus() {
			header.input.focus();
		},
		dispose() {
			header.input.removeEventListener("input", draw);
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
	copy.append(eyebrow, title);
	const input = document.createElement("input");
	input.className = "start-menu-search";
	input.type = "search";
	input.placeholder = "Search apps, files, social, and tools";
	input.setAttribute("aria-label", "Search Geelooy apps and actions");
	element.append(copy, input);
	return { element, input };
}

function renderResults(root, records, close) {
	root.replaceChildren();
	const apps = records.filter(record => record.kind === "app");
	const actions = records.filter(record => record.kind !== "app");
	if (apps.length) {
		root.append(createAppSection(apps, close));
	}
	root.append(...createActionSections(actions, close));
	if (!records.length) {
		root.append(createEmptyState());
	}
}
