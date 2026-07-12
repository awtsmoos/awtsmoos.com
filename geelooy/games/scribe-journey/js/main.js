// B"H

import { initInput } from './input.js';
import { createCanvasViewport } from './platform/canvasViewport.js';
import { createShellState } from './platform/shellState.js';
import { createVerificationBridge } from './platform/verificationBridge.js';
import { addParticle, renderGameState, updateTimeVisuals } from './render.js';
import { initUI } from './ui.js';
import * as GameEngine from './workers/gameWorker.js';

function startScribeJourney() {
	const canvas = document.getElementById('gameCanvas');
	const viewportElement = document.getElementById('world-viewport');
	const viewport = createCanvasViewport(canvas, viewportElement);
	const shell = createShellState();
	const verification = createVerificationBridge({ dispatch: GameEngine.dispatch, step: GameEngine.gameLoop });
	let input = null;

	function sendToEngine(action, payload = {}) {
		if (action === 'input') GameEngine.dispatch(payload);
		else GameEngine.dispatch({ action, ...payload });
	}

	const ui = initUI(sendToEngine);
	input = initInput(sendToEngine);
	const callbacks = {
		onStateUpdate({ state }) {
			verification.capture(state);
			shell.updateState(state);
			renderGameState(viewport.context, state);
		},
		onTimeUpdate(payload) {
			shell.updateTime(payload);
			updateTimeVisuals(viewport.context, payload.timeOfDay, payload.weather, payload.moonPhase, payload.isShabbat, payload.lightLevel, payload.maxLightLevel);
		},
		onUIUpdate(payload) {
			shell.updateUI(payload);
			ui.update(payload);
			if (payload.screen && payload.screen !== 'game') input?.releaseAll();
			if (payload.dialogue?.active) input?.releaseAll();
			if (payload.fx?.type === 'particles') {
				const width = canvas.__logicalWidth || canvas.clientWidth;
				const height = canvas.__logicalHeight || canvas.clientHeight;
				addParticle('spark', width / 2, height / 2, payload.fx.color, payload.fx.amount);
			}
		},
		onToast(payload) {
			ui.showToast(payload.message, payload.type);
		}
	};

	GameEngine.initGame(callbacks);
	const loop = now => {
		GameEngine.gameLoop(now);
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startScribeJourney, { once: true });
else startScribeJourney();
