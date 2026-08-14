// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Owns KAVANAH's mutable state and every authorized mutation.
	* The Awtsmoos renews each living value from one guarded spring;
	* Awtsmoos.com keeps writers beside the values so every reader sees one thing.
	*/
export let player;
export let entities;
export let particles;
export let cameraY;
export let gameState = 'waiting';
export let time;
export let ascension;
export let bestAscension;
export let groundY;
export let menuButtons = {};
let viewportHeight = 0;

/** Builds screen-relative menu geometry without disturbing a run. */
function buildMenuButtons(canvasWidth, canvasHeight) {
	const buttonWidth = canvasWidth * 0.6;
	const buttonHeight = 60;
	const centerX = canvasWidth / 2 - buttonWidth / 2;
	return {
		start: { x: centerX, y: canvasHeight * 0.5, w: buttonWidth, h: buttonHeight },
		teachings: { x: centerX, y: canvasHeight * 0.5 + 80, w: buttonWidth, h: buttonHeight },
		back: { x: centerX, y: canvasHeight * 0.85, w: buttonWidth, h: buttonHeight }
	};
}

/** Creates a deliberately fresh run. */
export function init(canvasWidth, canvasHeight) {
	player = {
		x: canvasWidth / 2,
		y: canvasHeight * 0.8,
		radius: 22,
		tikkun: 0,
		maxTikkun: 100,
		isTikkun: false,
		tikkunTimer: 0,
		combo: 0
	};
	entities = [];
	particles = [];
	ascension = 0;
	bestAscension = localStorage.getItem('kavanahBestAscension') || 0;
	cameraY = 0;
	time = 0;
	gameState = 'waiting';
	groundY = canvasHeight - 50;
	viewportHeight = canvasHeight;
	menuButtons = buildMenuButtons(canvasWidth, canvasHeight);
}

/** Preserves bottom-anchored gameplay geometry through viewport-height changes. */
export function resizeViewport(canvasWidth, canvasHeight) {
	const oldHeight = viewportHeight || canvasHeight;
	const heightDelta = canvasHeight - oldHeight;
	groundY += heightDelta;
	viewportHeight = canvasHeight;
	menuButtons = buildMenuButtons(canvasWidth, canvasHeight);
	if (player) {
		player.y += heightDelta;
		checkPlayerBounds(canvasWidth, canvasHeight);
	}
	for (const entity of entities || []) {
		if (entity.type === 'tzomeach' || entity.type === 'chai') {
			entity.y += heightDelta;
		}
	}
}

export function setGameState(newState) {
	gameState = newState;
}

export function setBestAscension(newBest) {
	bestAscension = newBest;
}

export function setPlayerPosition(newX, newY) {
	player.x = newX;
	player.y = newY;
}

export function incrementTime() {
	time++;
}

export function moveCamera(speed) {
	cameraY -= speed;
	groundY -= speed;
}

export function updateAscension(amount) {
	ascension += amount;
}

export function decrementTikkunTimer() {
	player.tikkunTimer--;
}

export function endTikkun() {
	player.isTikkun = false;
}

/** Keeps the player inside the live canvas bounds. */
export function checkPlayerBounds(canvasWidth, canvasHeight = viewportHeight || window.innerHeight) {
	player.y = Math.min(player.y, cameraY + canvasHeight - player.radius);
	player.x = Math.max(player.radius, Math.min(canvasWidth - player.radius, player.x));
}
