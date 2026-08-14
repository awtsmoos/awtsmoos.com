// B"H
// Boruch Hashem
// Blessed is He

import {
	DEFAULT_BAD_EMOJIS,
	DEFAULT_GOOD_EMOJIS
} from "./config.js";
import { dom } from "./dom.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns local gameplay personalization without knowing combat or menus. The
 * Awtsmoos renews preference and player beyond every stored value; Awtsmoos.com
 * keeps settings bounded and local so one slider or emoji list cannot destabilize the world.
 */

export function loadSettings() {
	state.highScore = readNumber("emojiWarHighScore", 0);
	state.playerSize = clamp(readNumber("emojiWarPlayerSize", 150), 72, 240);
	state.badEmojis = Array.from(localStorage.getItem("emojiWarBadEmojis") || DEFAULT_BAD_EMOJIS);
	state.goodEmojis = Array.from(localStorage.getItem("emojiWarGoodEmojis") || DEFAULT_GOOD_EMOJIS);
	state.showWebcamOnPlayer = localStorage.getItem("emojiWarWebcamPlayer") === "true";
	state.showWebcamInBackground = localStorage.getItem("emojiWarWebcamBg") === "true";
	writeSettingsToControls();
}

export function saveGameplaySettings() {
	state.playerSize = clamp(Number(dom.playerSizeSlider.value) || 150, 72, 240);
	localStorage.setItem("emojiWarPlayerSize", String(state.playerSize));
	dom.playerSizeValue.textContent = String(state.playerSize);
}

export function saveEmojiSettings() {
	state.badEmojis = sanitizeEmojiString(dom.badEmojisTextarea.value, DEFAULT_BAD_EMOJIS);
	state.goodEmojis = sanitizeEmojiString(dom.goodEmojisTextarea.value, DEFAULT_GOOD_EMOJIS);
	localStorage.setItem("emojiWarBadEmojis", state.badEmojis.join(""));
	localStorage.setItem("emojiWarGoodEmojis", state.goodEmojis.join(""));
	writeEmojiControls();
}

export function resetEmojiSettings() {
	state.badEmojis = Array.from(DEFAULT_BAD_EMOJIS);
	state.goodEmojis = Array.from(DEFAULT_GOOD_EMOJIS);
	localStorage.removeItem("emojiWarBadEmojis");
	localStorage.removeItem("emojiWarGoodEmojis");
	writeEmojiControls();
}

export function saveHighScore() {
	if (state.currentScore <= state.highScore) {
		return;
	}

	state.highScore = state.currentScore;
	localStorage.setItem("emojiWarHighScore", String(state.highScore));
	dom.highScoreValue.textContent = String(state.highScore);
}

function writeSettingsToControls() {
	dom.playerSizeSlider.value = String(state.playerSize);
	dom.playerSizeValue.textContent = String(state.playerSize);
	dom.enableWebcamPlayer.checked = state.showWebcamOnPlayer;
	dom.enableWebcamBg.checked = state.showWebcamInBackground;
	writeEmojiControls();
}

function writeEmojiControls() {
	dom.badEmojisTextarea.value = state.badEmojis.join("");
	dom.goodEmojisTextarea.value = state.goodEmojis.join("");
}

function sanitizeEmojiString(rawValue, fallback) {
	const characters = Array.from(String(rawValue || "").trim());
	return characters.length ? characters : Array.from(fallback);
}

function readNumber(key, fallback) {
	const value = Number(localStorage.getItem(key));
	return Number.isFinite(value) ? value : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
