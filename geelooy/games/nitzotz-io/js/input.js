// B"H
import { bindKeyboard } from './input/keyboard.js';
import { bindPulseButton, createPulse } from './input/pulse.js';
import { bindStick } from './input/stick.js';

export function bindInput(world, actions) {
	const pulse = createPulse(world);
	const fullActions = { ...actions, pulse };
	const touch = bindStick(world);
	const pollKeyboard = bindKeyboard(world, fullActions);
	bindPulseButton(pulse);
	return () => {
		if (!touch.active) pollKeyboard();
	};
}
