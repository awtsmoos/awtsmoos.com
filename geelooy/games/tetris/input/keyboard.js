//B"H
//Boruch Hashem
//Blessed be He

import { editable, horizontalDirection, isSoftDropCode, oneShotAction } from './keyboard-map.js';

/**
 * @file keyboard.js
 * @description Maps discoverable keyboard controls into semantic Tetris actions while delegating horizontal hold timing to one deterministic DAS/ARR controller.
 * Awtsmoos.com ignores browser repeat for movement so operating-system keyboard settings cannot alter gameplay cadence, while blur/pause/disposal release every owned intent.
 *
 * Architectural invariants:
 * - Left/Right and A/D register stable physical tokens with the shared horizontal repeat controller exactly once per press.
 * - Browser-generated repeated keydown events never create additional horizontal timers or one-shot actions.
 * - Down/S begins Soft Drop once and always receives a matching release.
 * - Space, C/Shift, P/Escape, and rotation keys remain finite one-shot semantic actions.
 * - Editable targets are never captured by gameplay keyboard handling.
 */
export function bindTetrisKeyboard(options) {
	let softDropActive = false;
	const ownedHorizontalTokens = new Set();
	const releaseSoftDrop = () => {
		if (!softDropActive) {
			return;
		}
		softDropActive = false;
		options.onAction('soft_drop_end');
	};
	const releaseHorizontal = () => {
		for (const token of ownedHorizontalTokens) {
			options.horizontalRepeat.release(token);
		}
		ownedHorizontalTokens.clear();
	};
	const release = () => {
		releaseSoftDrop();
		releaseHorizontal();
	};
	const down = event => {
		if (editable(event.target)) {
			return;
		}
		const direction = horizontalDirection(event.code);
		if (direction) {
			event.preventDefault();
			if (!event.repeat) {
				const token = `keyboard:${event.code}`;
				ownedHorizontalTokens.add(token);
				options.horizontalRepeat.press(token, direction);
			}
			return;
		}
		const action = oneShotAction(event.code);
		if (!action) {
			return;
		}
		event.preventDefault();
		if (action === 'pause') {
			if (!event.repeat) {
				release();
				options.onPause();
			}
			return;
		}
		if (action === 'soft_drop_start') {
			if (!softDropActive) {
				softDropActive = true;
				options.onAction('soft_drop_start');
			}
			return;
		}
		if (!event.repeat) {
			options.onAction(action);
		}
	};
	const up = event => {
		const direction = horizontalDirection(event.code);
		if (direction) {
			event.preventDefault();
			const token = `keyboard:${event.code}`;
			ownedHorizontalTokens.delete(token);
			options.horizontalRepeat.release(token);
			return;
		}
		if (isSoftDropCode(event.code)) {
			event.preventDefault();
			releaseSoftDrop();
		}
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
	return Object.freeze({
		release,
		dispose
	});
}
