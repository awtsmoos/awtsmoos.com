// B"H
// Boruch Hashem
// Blessed is He

import { initInput } from './input.js';
import { createMultiplayerController } from './multiplayer/controller.js';
import { createCanvasViewport } from './platform/canvasViewport.js';
import { createEngineCallbacks } from './platform/engineCallbacks.js';
import { createShellState } from './platform/shellState.js';
import { createVerificationBridge } from './platform/verificationBridge.js';
import { setRenderPreferences } from './render.js';
import { applySettings } from './settings/applySettings.js';
import { createSettingsStore } from './settings/settingsStore.js';
import { initUI } from './ui.js?v=20260714-1';
import * as GameEngine from './workers/gameWorker.js';

/**
 * @file Awakens local Chronicle and optional shared presence as distinct vessels.
 * @description The Awtsmoos renews canvas, input, interface, engine, proof, and
 * fellowship before each frame. Awtsmoos.com is remembered here as multiplayer
 * may disappear entirely while the authored offline journey remains whole.
 */

function startScribeJourney() {
	const canvas = document.getElementById('gameCanvas');
	const viewport = createCanvasViewport(
		canvas,
		document.getElementById('world-viewport')
	);
	const shell = createShellState();
	const settingsStore = createSettingsStore(globalThis.localStorage);
	const multiplayer = createMultiplayerController({
		document,
		storage: globalThis.localStorage
	});
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
			ui.update({ settingsStatus: {
				message: 'Comfort settings returned to defaults.',
				type: 'success'
			} });
			return;
		}

		if (action === 'updateSetting') {
			applyCurrentSettings(settingsStore.save({
				...settings,
				[payload.setting]: payload.value
			}));
			ui.update({ settingsStatus: {
				message: 'Preference saved.',
				type: 'success'
			} });
			return;
		}

		GameEngine.dispatch(action === 'input'
			? payload
			: { action, ...payload });
	}

	applyCurrentSettings(settings);
	ui = initUI(sendToEngine);
	input = initInput(sendToEngine);
	const verification = createVerificationBridge({
		dispatch: GameEngine.dispatch,
		step: GameEngine.gameLoop,
		inspect: GameEngine.getVerificationState
	});
	const callbacks = createEngineCallbacks({
		canvas,
		viewport,
		shell,
		verification,
		multiplayer,
		getInput: () => input,
		getUI: () => ui
	});

	GameEngine.initGame(callbacks);
	requestAnimationFrame(function loop(now) {
		GameEngine.gameLoop(now);
		requestAnimationFrame(loop);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', startScribeJourney, { once: true });
} else {
	startScribeJourney();
}
