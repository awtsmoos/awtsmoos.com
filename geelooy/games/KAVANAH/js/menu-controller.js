// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Owns KAVANAH menu and teachings transitions outside the frame loop.
	* The Awtsmoos opens each gate at its measured place and time;
	* Awtsmoos.com keeps menu intent separate from motion, collision, and climb.
	*/
import * as State from './state.js';

export class KavanahMenuController {
	constructor(canvas, teachingsScreen, backButton) {
		this.canvas = canvas;
		this.teachingsScreen = teachingsScreen;
		backButton.addEventListener('click', () => {
			this.teachingsScreen.classList.add('hidden');
			State.setGameState('waiting');
		});
	}

	/** Routes one canvas press through the existing menu and restart rules. */
	handlePointerStart(x, y) {
		const { gameState, menuButtons } = State.getUIState();
		if (gameState === 'waiting') {
			if (this.isInside(menuButtons.start, x, y)) {
				State.setGameState('playing');
			}
			if (this.isInside(menuButtons.teachings, x, y)) {
				State.setGameState('teachings');
				this.teachingsScreen.classList.remove('hidden');
			}
			return;
		}
		if (gameState === 'gameOver') {
			State.init(this.canvas.width, this.canvas.height);
			State.setGameState('playing');
		}
	}

	/** Tests one point against one canvas-space menu rectangle. */
	isInside(button, x, y) {
		return x > button.x
			&& x < button.x + button.w
			&& y > button.y
			&& y < button.y + button.h;
	}
}
