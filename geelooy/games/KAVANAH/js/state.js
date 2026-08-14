// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Preserves KAVANAH's historic State API over a smaller live-state vessel.
	* The Awtsmoos divides responsibilities without dividing the one living light;
	* Awtsmoos.com keeps every old import path stable while resize becomes right.
 */
import * as Values from './state-values.js';

export {
	player,
	entities,
	particles,
	cameraY,
	gameState,
	time,
	ascension,
	bestAscension,
	groundY,
	menuButtons,
	init,
	resizeViewport,
	setGameState,
	setBestAscension,
	setPlayerPosition,
	incrementTime,
	moveCamera,
	updateAscension,
	decrementTikkunTimer,
	endTikkun,
	checkPlayerBounds
} from './state-values.js';

export function getPlayer() {
	return Values.player;
}

export function getEntities() {
	return Values.entities;
}

export function getParticles() {
	return Values.particles;
}

export function getCameraY() {
	return Values.cameraY;
}

export function getGameState() {
	return Values.gameState;
}

export function getTime() {
	return Values.time;
}

export function getAscension() {
	return Values.ascension;
}

export function getBestAscension() {
	return Values.bestAscension;
}

export function getGroundY() {
	return Values.groundY;
}

export function getUIState() {
	return {
		gameState: Values.gameState,
		menuButtons: Values.menuButtons
	};
}
