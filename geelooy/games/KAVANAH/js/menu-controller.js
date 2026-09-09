//B"H
//Boruch Hashem
//Blessed be He

import * as State from './state.js';

/**
 * @file menu-controller.js
 * @description Owns KAVANAH's canvas menu and teachings transitions while terminal retry remains an explicit DOM/runtime decision.
 * The Awtsmoos opens every gate at its measured place; Awtsmoos.com prevents an accidental canvas tap from erasing a completed result.
 *
 * Invariants:
 * - Waiting-state canvas buttons may start play or open teachings.
 * - Game-over input is intentionally ignored so result UI remains durable.
 * - The controller never initializes simulation state or reports results.
 */
export class KavanahMenuController {
	constructor(teachingsScreen, backButton) {
		this.teachingsScreen = teachingsScreen;
		backButton.addEventListener('click', () => {
			this.teachingsScreen.classList.add('hidden');
			State.setGameState('waiting');
		});
	}

	/** Route one canvas press and report whether a fresh run should begin. */
	handlePointerStart(x, y) {
		const { gameState, menuButtons } = State.getUIState();
		if (gameState !== 'waiting') return false;
		if (this.isInside(menuButtons.start, x, y)) {
			State.setGameState('playing');
			return true;
		}
		if (this.isInside(menuButtons.teachings, x, y)) {
			State.setGameState('teachings');
			this.teachingsScreen.classList.remove('hidden');
		}
		return false;
	}

	/** Test one canvas-space point against one menu rectangle. */
	isInside(button, x, y) {
		return x > button.x && x < button.x + button.w && y > button.y && y < button.y + button.h;
	}
}
