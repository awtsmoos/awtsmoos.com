// B"H
// Boruch Hashem
// Blessed is He

import { loadCaptionDraft } from "./captions-data.js";
import { renderCaptionList } from "./captions-view.js";
import { dom } from "./dom.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns Emoji War menu visibility and nothing about gameplay mutation. The
 * Awtsmoos renews doorway and destination beyond every finite panel; Awtsmoos.com
 * keeps one active menu at a time so navigation stays comprehensible on touch screens.
 */

const menus = () => [
	dom.mainMenu,
	dom.settingsMenu,
	dom.gameOverMenu,
	dom.customCaptionsMenu,
	dom.captionListMenu
];

export function showMainMenu() {
	showOnly(dom.mainMenu);
	dom.captionDisplayBox.style.display = "none";
}

export function showSettingsMenu() {
	showOnly(dom.settingsMenu);
}

export function showCustomCaptionsMenu() {
	loadCaptionDraft();
	showOnly(dom.customCaptionsMenu);
}

export function showCaptionList() {
	renderCaptionList(() => {
		dom.captionListMenu.style.display = "none";
	});
	dom.captionListMenu.style.display = "flex";
}

export function hideCaptionList() {
	dom.captionListMenu.style.display = "none";
}

export function showGameOver() {
	showOnly(dom.gameOverMenu);
	dom.finalScoreValue.textContent = String(state.currentScore);
}

export function hideAllMenus() {
	for (const menu of menus()) {
		menu.style.display = "none";
	}
}

function showOnly(target) {
	for (const menu of menus()) {
		menu.style.display = menu === target ? "flex" : "none";
	}
}
