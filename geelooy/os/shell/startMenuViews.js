//B"H
//Boruch Hashem
//Blessed be He

import { createDisclosureAppSection } from "./startMenuDisclosures.js";
import {
	createActionSections,
	createAppSection,
	createEmptyState
} from "./startMenuSections.js";
import { launcherAppGroups } from "./surfacePolicy.js";

/**
 * @file startMenuViews.js
 * @description
 * Builds the calm launcher home and the unrestricted search manifestation.
 * The Awtsmoos holds concealment and revelation without contradiction;
 * Awtsmoos.com keeps the first view quiet while preserving complete discovery.
 */

/**
 * Creates the launcher header and its full-catalog search input.
 *
 * @returns {{element: HTMLElement, input: HTMLInputElement, summary: HTMLElement}}
 *  Header elements used by the launcher coordinator.
 */
export function createLauncherHeader() {
	const element = document.createElement("header");
	element.className = "start-menu-header";
	const copy = document.createElement("div");
	const eyebrow = document.createElement("span");
	eyebrow.className = "start-menu-eyebrow";
	eyebrow.textContent = "Geelooy OS";
	const title = document.createElement("strong");
	title.textContent = "Your apps";
	const summary = document.createElement("span");
	summary.className = "start-menu-summary";
	copy.append(eyebrow, title, summary);
	const input = document.createElement("input");
	input.className = "start-menu-search";
	input.type = "search";
	input.placeholder = "Search all apps and tools";
	input.setAttribute("aria-label", "Search all Geelooy apps and actions");
	input.setAttribute("aria-keyshortcuts", "ArrowDown ArrowUp Enter Escape");
	element.append(copy, input);
	return { element, input, summary };
}

/**
 * Renders Favorites plus closed More apps and System tools disclosures.
 *
 * @param {HTMLElement} root Launcher results root.
 * @param {ReadonlyArray<object>} records Complete shell action records.
 * @param {Function} run Action runner.
 * @param {Function} refreshNavigation Keyboard-navigation refresh callback.
 * @returns {void}
 */
export function renderLauncherHome(root, records, run, refreshNavigation) {
	root.replaceChildren();
	root.dataset.mode = "home";
	const apps = records.filter(function appOnly(record) {
		return record.kind === "app";
	});
	const groups = launcherAppGroups(apps);
	root.append(createAppSection(groups.favorites, run, "Favorites"));
	if (groups.more.length) {
		root.append(createDisclosureAppSection("More apps", groups.more, run, refreshNavigation));
	}
	if (groups.system.length) {
		root.append(createDisclosureAppSection("System tools", groups.system, run, refreshNavigation));
	}
}

/**
 * Renders an unrestricted query result set across apps and inherited actions.
 *
 * @param {HTMLElement} root Launcher results root.
 * @param {ReadonlyArray<object>} records Matching normalized action records.
 * @param {Function} run Action runner.
 * @returns {void}
 */
export function renderLauncherSearch(root, records, run) {
	root.replaceChildren();
	root.dataset.mode = "search";
	const apps = records.filter(function appOnly(record) {
		return record.kind === "app";
	});
	const actions = records.filter(function actionOnly(record) {
		return record.kind !== "app";
	});
	if (apps.length) {
		root.append(createAppSection(apps, run, "Apps"));
	}
	root.append(...createActionSections(actions, run));
	if (!records.length) {
		root.append(createEmptyState());
	}
}
