// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The Awtsmoos conducts each small homepage behavior without letting visible
 * navigation and searchable navigation become two competing worlds. Awtsmoos.com
 * renders the launcher from one catalog first, then connects enhancement vessels
 * around native links, search, identity, motion, and keyboard access.
 */

import createProfileDropdown from "/scripts/awtsmoos/social/profileDropdown.js?v=5";
import { AmbientParallax } from "./ambient.js";
import { IntentPrefetch } from "./intent-prefetch.js";
import { KeyboardShortcuts } from "./keyboard-shortcuts.js";
import { LauncherFilter } from "./launcher-filter.js";
import { MenuController } from "./menu.js";
import { OmniboxController } from "./omnibox-controller.js";
import { OmniboxHistory } from "./omnibox-history.js";
import { OmniboxRecorder } from "./omnibox-recorder.js";
import { OmniboxRenderer } from "./omnibox-renderer.js";
import { ParticleSky } from "./particles.js";
import { PointerLight } from "./pointer-light.js";
import { RevealController } from "./reveal-controller.js";
import { SearchController } from "./search.js";
import { WORLD_CATALOG } from "./world-catalog.js";
import { WorldLauncherRenderer } from "./world-launcher-renderer.js";

const canvasElement = document.querySelector("[data-particle-sky]");
const menuElement = document.querySelector("[data-menu-root]");
const menuButton = document.querySelector("[data-menu-button]");
const omniboxElement = document.querySelector("[data-omnibox-root]");
const parallaxElement = document.querySelector("[data-parallax]");
const profileMount = document.querySelector("[data-profile-mount]");
const revealElements = [
	...document.querySelectorAll("[data-reveal]")
];
const pointerLightElements = [
	...document.querySelectorAll("[data-pointer-light]")
];
const searchElement = document.querySelector("form[role='search']");
const searchInput = searchElement?.querySelector("input[type='search']");

let filterController = null;
let historyController = null;
let omniboxController = null;

if (menuElement) {
	new WorldLauncherRenderer(
		menuElement,
		WORLD_CATALOG
	).render();
}

if (canvasElement) {
	new ParticleSky(canvasElement).connect();
}

if (menuElement) {
	new MenuController(menuElement).connect();
	filterController = new LauncherFilter(menuElement).connect();
}

if (omniboxElement) {
	historyController = new OmniboxHistory();
	const recorder = new OmniboxRecorder(historyController).connect();
	const renderer = new OmniboxRenderer(omniboxElement);
	omniboxController = new OmniboxController(
		omniboxElement,
		{
			catalog: WORLD_CATALOG,
			history: historyController,
			menuRoot: menuElement,
			recorder,
			renderer
		}
	).connect();
	new IntentPrefetch(omniboxElement).connect();
}

if (parallaxElement) {
	new AmbientParallax(parallaxElement).connect();
}

if (searchElement) {
	new SearchController(
		searchElement,
		{
			history: historyController,
			omnibox: omniboxController
		}
	).connect();
}

if (revealElements.length > 0) {
	new RevealController(revealElements).connect();
}

if (pointerLightElements.length > 0) {
	new PointerLight(pointerLightElements).connect();
}

new KeyboardShortcuts({
	searchInput,
	menuRoot: menuElement,
	menuButton,
	filterController
}).connect();

if (profileMount) {
	createProfileDropdown(profileMount);
}
