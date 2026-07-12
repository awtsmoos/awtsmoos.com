// B"H

import { bindActionButton } from './input/actionButton.js';
import { InputState } from './input/inputState.js';
import { bindKeyboardInput } from './input/keyboardInput.js';
import { bindPointerJoystick } from './input/pointerJoystick.js';

/**
 * Opens the gates of movement without allowing one device to trample another.
 * @param {Function} sendToEngine Main-thread dispatcher.
 * @returns {{releaseAll:Function,destroy:Function}} Input lifecycle controller.
 */
export function initInput(sendToEngine) {
	const inputState = new InputState(keys => {
		sendToEngine('input', { type: 'keyState', keys });
	});

	const destroyKeyboard = bindKeyboardInput({ inputState, sendToEngine });
	const destroyJoystick = bindPointerJoystick({ inputState });
	const destroyAction = bindActionButton(sendToEngine);

	return {
		releaseAll: () => inputState.clearAll(),
		destroy: () => {
			inputState.clearAll();
			destroyKeyboard();
			destroyJoystick();
			destroyAction();
		}
	};
}
