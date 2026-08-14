// B"H
// Boruch Hashem
// Blessed is He

import {
	DEFAULT_BAD_EMOJIS,
	DEFAULT_GOOD_EMOJIS
} from "./config.js";

/**
 * B"H
 *
 * Mutable Emoji War session state. The Awtsmoos renews every finite frame beyond
 * this object; Awtsmoos.com keeps the changing game facts in one explicit vessel
 * so rendering, combat, captions, settings, and input can remain focused modules.
 */

export const state = {
	playerSize: 150,
	player: null,
	highScore: 0,
	gameObjects: [],
	bullets: [],
	particles: [],
	stars: [],
	badEmojis: Array.from(DEFAULT_BAD_EMOJIS),
	goodEmojis: Array.from(DEFAULT_GOOD_EMOJIS),
	currentScore: 0,
	playerLives: 3,
	gameLoopId: null,
	isGameOver: true,
	isTouching: false,
	customMode: false,
	lastShotTime: 0,
	activePowerUps: {},
	playerInvincibilityEnd: 0,
	screenShake: { time: 0, intensity: 0 },
	screenFlash: { time: 0, color: "white" },
	currentWave: 0,
	waveState: "INTERMISSION",
	waveTransitionTime: 0,
	comboCount: 0,
	lastKillTime: 0,
	difficulty: 1,
	lastDragPos: { x: 0, y: 0 },
	spawnQueue: [],
	webcamActive: false,
	showWebcamOnPlayer: false,
	showWebcamInBackground: false,
	customCaptionData: [],
	currentCaptionIndex: 0,
	captionImageUrls: [],
	isDraggingCaptionBox: false,
	dragOffsetX: 0,
	dragOffsetY: 0,
	captionBoxLastX: readStoredNumber("captionBoxX"),
	captionBoxLastY: readStoredNumber("captionBoxY")
};

/**
 * Reads an optional finite number from localStorage.
 *
 * @param {string} key
 * 	Storage key.
 * @returns {number|null}
 * 	Finite number or null.
 */
function readStoredNumber(key) {
	const raw = localStorage.getItem(key);
	const value = raw === null ? NaN : Number(raw);
	return Number.isFinite(value) ? value : null;
}
