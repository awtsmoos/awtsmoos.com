// B"H

import { TILE_SIZE } from '../data/database.js';
import { maps as staticMaps } from '../data/maps.js';
import { createSaveService } from '../persistence/saveService.js';
import * as BotSystem from './botSystem.js';
import { createTriggers } from './systems/triggers.js';
import { createActionDispatcher } from './runtime/actionDispatcher.js';
import { createFrameRunner } from './runtime/frameRunner.js';
import { createMapContext } from './runtime/mapContext.js';
import { createFreshGameState, initialTimePayload } from './runtime/stateFactory.js';

let gameState = {};
let trigger = null;
let frameRunner = null;
let dispatchAction = null;
let callbacks = {
	onStateUpdate() {},
	onUIUpdate() {},
	onTimeUpdate() {},
	onToast() {}
};

const mapContext = createMapContext(staticMaps);

function adoptState(nextState, { initializeBots = false } = {}) {
	gameState = nextState;
	mapContext.invalidate();
	mapContext.update(gameState);
	if (initializeBots) BotSystem.initBots(gameState, staticMaps);
	trigger = createTriggers(gameState, callbacks);
	frameRunner?.resetClock();
	callbacks.onTimeUpdate(initialTimePayload(gameState));
	return gameState;
}

function resetGame() {
	return adoptState(createFreshGameState(), { initializeBots: true });
}

/**
 * Public engine vessel. The world, persistence, and frame laws live in small
 * modules; this file only binds them into one renewed runtime.
 */
export function initGame(nextCallbacks) {
	callbacks = { ...callbacks, ...nextCallbacks };
	const persistence = createSaveService({
		storage: globalThis.localStorage,
		createFreshState: createFreshGameState,
		maps: staticMaps,
		tileSize: TILE_SIZE
	});
	frameRunner = createFrameRunner({
		getState: () => gameState,
		getTrigger: () => trigger,
		callbacks,
		staticMaps,
		mapContext
	});
	dispatchAction = createActionDispatcher({
		getState: () => gameState,
		getTrigger: () => trigger,
		callbacks,
		mapContext,
		persistence,
		resetGame,
		adoptState
	});
	resetGame();
	gameState.mode = 'main-menu';
	callbacks.onUIUpdate({ screen: 'main-menu' });
}

export function gameLoop(now) {
	frameRunner?.step(now);
}

export function dispatch(payload) {
	dispatchAction?.(payload);
}
