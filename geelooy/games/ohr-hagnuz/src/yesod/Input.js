/**
 * B"H
 * @class Input
 * @description Small facade over keyboard and pointer input modules.
 */
import { State } from '../binah/State.js';
import { handleKeyboardDown, handleKeyboardUp, keyIntentMap } from './input/KeyboardInput.js';
import { bindPointerInput } from './input/PointerInput.js';
import { Logic } from './Logic.js';

export class Input {
	static bound = false;

	static bind() {
		if (this.bound) return;
		this.bound = true;
		const map = keyIntentMap();
		const handlers = this.handlers();
		window.addEventListener('keydown', event => handleKeyboardDown(event, map, handlers), { passive: false });
		window.addEventListener('keyup', event => handleKeyboardUp(event, map), { passive: false });
		bindPointerInput(handlers);
	}

	static handlers() {
		return {
			cancelPath: reason => Logic.cancelPath(reason),
			setPath: (x, y) => Logic.setPathTo(x, y),
			commitBattle: index => this.commitBattle(index)
		};
	}

	static commitBattle(index) {
		State.Debate.cursor = index;
		Logic.selectDebateMove(index);
	}
}
