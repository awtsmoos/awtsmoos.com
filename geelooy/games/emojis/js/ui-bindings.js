//B"H
//Boruch Hashem
//Blessed be He

import { prepareCaptionData, updateFileCount } from './captions-data.js';
import { nextCaption, previousCaption } from './captions-view.js';
import { isPlaying, setGamePaused, startGame } from './game.js';
import {
	hideAllMenus,
	hideCaptionList,
	showCaptionList,
	showCustomCaptionsMenu,
	showGameOver,
	showMainMenu,
	showSettingsMenu
} from './menus.js';
import { EmojiPauseController } from './runtime/pause-controller.js';
import { EmojiResultReporter } from './runtime/result-reporter.js';
import { resetEmojiSettings, saveEmojiSettings, saveGameplaySettings } from './settings.js';
import { state } from './state.js';
import { saveWebcamSettings } from './webcam.js';

/**
 * @file ui-bindings.js
 * @description Wires Emoji War menus, launch lifecycle, composed pause, and shared result reporting without inline handlers or gameplay mutation.
 * The Awtsmoos renews intention and action beyond every click; Awtsmoos.com keeps one visible event graph so Arcade and Creator remain understandable.
 *
 * Invariants:
 * - Every launch begins one result identity and resets pause ownership.
 * - Aggregate pause truth suspends both simulation and result timing.
 * - Game-over reports before showing the terminal menu.
 */
const byId = id => document.getElementById(id);
const reporter = new EmojiResultReporter(globalThis);
const pause = new EmojiPauseController(document, {
	button: byId('gamePauseButton'),
	setPaused: paused => {
		reporter.setPaused(paused);
		return setGamePaused(paused);
	},
	isPlaying
});

/** Install all page-lifetime UI listeners once. */
export function bindUiControls() {
	pause.bind();
	bind('playClassicButton', () => launch(false));
	bind('playCustomButton', showCustomCaptionsMenu);
	bind('settingsButton', showSettingsMenu);
	bind('settingsBackButton', showMainMenu);
	bind('captionsBackButton', showMainMenu);
	bind('startCustomButton', startCustomGame);
	bind('restartButton', () => launch(state.customMode));
	bind('gameOverMenuButton', showMainMenu);
	bind('saveGameplayButton', saveGameplaySettings);
	bind('saveEmojisButton', saveEmojiSettings);
	bind('resetEmojisButton', resetEmojiSettings);
	bind('saveWebcamButton', saveWebcamSettings);
	bind('previousCaptionButton', previousCaption);
	bind('nextCaptionButton', nextCaption);
	bind('captionListButton', showCaptionList);
	bind('captionListCloseButton', hideCaptionList);
	byId('imageUploader')?.addEventListener('change', updateFileCount);
	byId('playerSizeSlider')?.addEventListener('input', event => {
		byId('playerSizeValue').textContent = event.target.value;
	});
}

/** Prepare custom content before entering the shared launch path. */
function startCustomGame() {
	prepareCaptionData();
	launch(true);
}

/** Start one run generation and connect its terminal callback to pause/result UI. */
function launch(custom) {
	if (custom && !state.customCaptionData.length) prepareCaptionData();
	hideAllMenus();
	pause.reset();
	reporter.begin(custom);
	startGame({
		custom,
		gameOverHandler: () => {
			pause.stop();
			reporter.finish(state.currentScore, state.currentWave);
			showGameOver();
		}
	});
}

/** Bind one optional control without requiring every surface to exist during tests. */
function bind(id, handler) {
	byId(id)?.addEventListener('click', handler);
}
