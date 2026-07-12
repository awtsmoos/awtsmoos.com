// B"H

import { initInput } from './input.js';
import { createCanvasViewport } from './platform/canvasViewport.js';
import { createShellState } from './platform/shellState.js';
import { createVerificationBridge } from './platform/verificationBridge.js';
import { addParticle, renderGameState, setRenderPreferences, updateTimeVisuals } from './render.js';
import { applySettings } from './settings/applySettings.js';
import { createSettingsStore } from './settings/settingsStore.js';
import { initUI } from './ui.js';
import * as GameEngine from './workers/gameWorker.js';

function startScribeJourney() {
	const canvas = document.getElementById('gameCanvas');
	const viewportElement = document.getElementById('world-viewport');
	const viewport = createCanvasViewport(canvas, viewportElement);
	const shell = createShellState();
	const settingsStore = createSettingsStore(globalThis.localStorage);
	let settings = settingsStore.load();
	let input = null;
	let ui = null;

	function applyCurrentSettings(nextSettings) {
		settings = nextSettings;
		applySettings(settings);
		setRenderPreferences(settings);
		ui?.update({ settings });
	}

	function sendToEngine(action, payload = {}) {
		const requestedAction = payload.action || action;
		if (requestedAction === 'settings-screen') {
			ui.openSettings(settings);
			shell.setMode('settings-screen');
			input?.releaseAll();
			return;
		}
		if (requestedAction === 'close-settings') {
			const destination = ui.closeSettings();
			shell.setMode(destination === 'game' ? 'game' : destination);
			return;
		}
		if (requestedAction === 'resetSettings') {
			applyCurrentSettings(settingsStore.reset());
			ui.update({ settingsStatus: { message: 'Comfort settings returned to defaults.', type: 'success' } });
			return;
		}
		if (action === 'updateSetting') {
			applyCurrentSettings(settingsStore.save({ ...settings, [payload.setting]: payload.value }));
			ui.update({ settingsStatus: { message: 'Preference saved.', type: 'success' } });
			return;
		}
		if (action === 'input') GameEngine.dispatch(payload);
		else GameEngine.dispatch({ action, ...payload });
	}

	applyCurrentSettings(settings);
	ui = initUI(sendToEngine);
	input = initInput(sendToEngine);
	const verification = createVerificationBridge({ dispatch: GameEngine.dispatch, step: GameEngine.gameLoop });
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
	requestAnimationFrame(function loop(now) {
		GameEngine.gameLoop(now);
		requestAnimationFrame(loop);
	});
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startScribeJourney, { once: true });
else startScribeJourney();
