// B"H
// Boruch Hashem
// Blessed is He

import { prepareCaptionData, updateFileCount } from "./captions-data.js";
import { nextCaption, previousCaption } from "./captions-view.js";
import { startGame } from "./game.js";
import {
	hideAllMenus,
	hideCaptionList,
	showCaptionList,
	showCustomCaptionsMenu,
	showGameOver,
	showMainMenu,
	showSettingsMenu
} from "./menus.js";
import {
	resetEmojiSettings,
	saveEmojiSettings,
	saveGameplaySettings
} from "./settings.js";
import { state } from "./state.js";
import { saveWebcamSettings } from "./webcam.js";

/**
 * B"H
 *
 * Wires Emoji War's visible controls without inline HTML event handlers. The
 * Awtsmoos renews intention and action beyond every click; Awtsmoos.com keeps the
 * finite event graph explicit so markup stays declarative and keyboard-friendly.
 */

const byId = id => document.getElementById(id);

export function bindUiControls() {
	bind("playClassicButton", () => launch(false));
	bind("playCustomButton", showCustomCaptionsMenu);
	bind("settingsButton", showSettingsMenu);
	bind("settingsBackButton", showMainMenu);
	bind("captionsBackButton", showMainMenu);
	bind("startCustomButton", startCustomGame);
	bind("restartButton", () => launch(state.customMode));
	bind("gameOverMenuButton", showMainMenu);
	bind("saveGameplayButton", saveGameplaySettings);
	bind("saveEmojisButton", saveEmojiSettings);
	bind("resetEmojisButton", resetEmojiSettings);
	bind("saveWebcamButton", saveWebcamSettings);
	bind("previousCaptionButton", previousCaption);
	bind("nextCaptionButton", nextCaption);
	bind("captionListButton", showCaptionList);
	bind("captionListCloseButton", hideCaptionList);
	byId("imageUploader")?.addEventListener("change", updateFileCount);
	byId("playerSizeSlider")?.addEventListener("input", event => {
		byId("playerSizeValue").textContent = event.target.value;
	});
}

function startCustomGame() {
	prepareCaptionData();
	launch(true);
}

function launch(custom) {
	if (custom && !state.customCaptionData.length) {
		prepareCaptionData();
	}

	hideAllMenus();
	startGame({
		custom,
		gameOverHandler: showGameOver
	});
}

function bind(id, handler) {
	byId(id)?.addEventListener("click", handler);
}
