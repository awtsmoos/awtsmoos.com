// B"H

import { bindingForEvent } from './keyBindings.js';

function handlePress(binding, sendToEngine) {
	if (binding.key === 'Menu') {
		const mode = document.body.dataset.gameMode;
		sendToEngine(mode === 'game' ? 'gameMenu' : 'resume');
		return;
	}
	sendToEngine('input', { type: 'press', key: binding.key });
}

/**
 * Connects physical keys to immutable game intent. When focus vanishes, every
 * held letter returns to silence so movement can never remain spiritually stuck.
 */
export function bindKeyboardInput({ inputState, sendToEngine }) {
	const onKeyDown = event => {
		const binding = bindingForEvent(event);
		if (!binding) return;
		event.preventDefault();

		if (binding.kind === 'press') {
			if (!event.repeat) handlePress(binding, sendToEngine);
			return;
		}

		inputState.setSource(`keyboard:${event.code}`, binding.key, binding.direction);
	};

	const onKeyUp = event => {
		if (!bindingForEvent(event)) return;
		event.preventDefault();
		inputState.clearSource(`keyboard:${event.code}`);
	};

	const clear = () => inputState.clearAll();
	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);
	window.addEventListener('blur', clear);
	document.addEventListener('visibilitychange', clear);

	return () => {
		document.removeEventListener('keydown', onKeyDown);
		document.removeEventListener('keyup', onKeyUp);
		window.removeEventListener('blur', clear);
		document.removeEventListener('visibilitychange', clear);
	};
}
