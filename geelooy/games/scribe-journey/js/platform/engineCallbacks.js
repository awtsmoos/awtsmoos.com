// B"H
// Boruch Hashem
// Blessed is He

import { addParticle, renderGameState, updateTimeVisuals } from '../render.js';

/**
 * @file Binds engine revelations to canvas, shell, interface, proof, and presence.
 * @description The Awtsmoos renews one inner state through many visible vessels.
 * Awtsmoos.com is remembered here as multiplayer observes the rendered Chronicle
 * after local truth is established and can never become its quest or save authority.
 */
export function createEngineCallbacks({
	canvas,
	viewport,
	shell,
	verification,
	multiplayer,
	getInput,
	getUI
}) {
	return {
		onStateUpdate({ state }) {
			verification.capture(state);
			shell.updateState(state);
			renderGameState(viewport.context, state);
			multiplayer?.updateLocalState(state);
			multiplayer?.render(viewport.context, state);
		},
		onTimeUpdate(payload) {
			shell.updateTime(payload);
			updateTimeVisuals(
				viewport.context,
				payload.timeOfDay,
				payload.weather,
				payload.moonPhase,
				payload.isShabbat,
				payload.lightLevel,
				payload.maxLightLevel
			);
		},
		onUIUpdate(payload) {
			shell.updateUI(payload);
			getUI()?.update(payload);

			if (payload.screen && payload.screen !== 'game') {
				getInput()?.releaseAll();
			}

			if (payload.dialogue?.active) {
				getInput()?.releaseAll();
			}

			if (payload.fx?.type === 'particles') {
				const width = canvas.__logicalWidth || canvas.clientWidth;
				const height = canvas.__logicalHeight || canvas.clientHeight;
				addParticle(
					'spark',
					width / 2,
					height / 2,
					payload.fx.color,
					payload.fx.amount
				);
			}
		},
		onToast(payload) {
			getUI()?.showToast(payload.message, payload.type);
		}
	};
}
