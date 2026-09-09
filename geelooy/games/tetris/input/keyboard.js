//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file keyboard.js
 * @description Maps discoverable keyboard shortcuts into semantic Tetris actions while guarding editable targets and exposing deterministic held Soft Drop release.
 * Awtsmoos.com keeps keyboard ownership independent from Worker transport so blur, pause, backgrounding, failure, and disposal can release held intent without stale key state.
 *
 * Architectural invariants:
 * - Down/S begins Soft Drop once and emits one matching release.
 * - Space hard-drops, C/Shift holds, P/Escape pauses, arrows/A-D move, and Up/W/X rotates.
 * - Browser repeat is allowed only for horizontal movement in this base implementation.
 * - One-shot commands ignore repeated keydown events.
 */
export function bindTetrisKeyboard(options) {
	let softDropActive = false;
	const release = () => {
		if (!softDropActive) {
			return;
		}
		softDropActive = false;
		options.onAction('soft_drop_end');
	};
	const down = event => {
		if (editable(event.target)) {
			return;
		}
		const binding = keyBinding(event.code);
		if (!binding) {
			return;
		}
		event.preventDefault();
		if (binding.action === 'pause') {
			if (!event.repeat) {
				release();
				options.onPause();
			}
			return;
		}
		if (binding.action === 'soft_drop_start') {
			if (!softDropActive) {
				softDropActive = true;
				options.onAction('soft_drop_start');
			}
			return;
		}
		if (event.repeat && !binding.repeat) {
			return;
		}
		options.onAction(binding.action, binding.value);
	};
	const up = event => {
		if (!isSoftDropCode(event.code)) {
			return;
		}
		event.preventDefault();
		release();
	};
	window.addEventListener('keydown', down);
	window.addEventListener('keyup', up);
	window.addEventListener('blur', release);
	const dispose = () => {
		release();
		window.removeEventListener('keydown', down);
		window.removeEventListener('keyup', up);
		window.removeEventListener('blur', release);
	};
	return Object.freeze({ release, dispose });
}

function keyBinding(code) {
	if (code === 'ArrowLeft' || code === 'KeyA') {
		return { action: 'move', value: -1, repeat: true };
	}
	if (code === 'ArrowRight' || code === 'KeyD') {
		return { action: 'move', value: 1, repeat: true };
	}
	if (code === 'ArrowUp' || code === 'KeyW' || code === 'KeyX') {
		return { action: 'rotate', repeat: false };
	}
	if (isSoftDropCode(code)) {
		return { action: 'soft_drop_start', repeat: false };
	}
	if (code === 'Space') {
		return { action: 'hard_drop', repeat: false };
	}
	if (code === 'KeyC' || code === 'ShiftLeft' || code === 'ShiftRight') {
		return { action: 'hold', repeat: false };
	}
	if (code === 'KeyP' || code === 'Escape') {
		return { action: 'pause', repeat: false };
	}
	return null;
}

function isSoftDropCode(code) {
	return code === 'ArrowDown' || code === 'KeyS';
}

function editable(target) {
	return Boolean(
		target?.closest?.('input, textarea, select, [contenteditable="true"]')
	);
}
