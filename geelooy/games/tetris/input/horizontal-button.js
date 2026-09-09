//B"H
//Boruch Hashem
//Blessed be He

import { tryCapturePointer } from './pointer-capture.js';

/**
 * @file horizontal-button.js
 * @description Binds one visible horizontal button to pointer-held repeat intent plus ordinary keyboard/button activation.
 * Awtsmoos.com keeps pointer token ownership, capture resilience, ARIA pressed truth, and listener cleanup isolated from repeat arbitration.
 *
 * Architectural invariants:
 * - Every active pointer receives one stable token derived from button ID and pointer ID.
 * - Pointer-generated click never adds a second movement after pointerdown already moved immediately.
 * - Native keyboard activation still performs one semantic tap through click detail zero.
 * - Pointer capture failure is non-fatal and cannot suppress semantic input.
 */
export function bindHorizontalButton(options) {
	const {
		root,
		id,
		direction,
		repeatController,
		disposers,
		releasers
	} = options;
	const button = root.querySelector(`#${id}`);
	if (!button) {
		return false;
	}
	const activeTokens = new Set();
	const updatePressed = () => {
		button.setAttribute(
			'aria-pressed',
			String(activeTokens.size > 0)
		);
	};
	const releaseToken = pointerId => {
		const token = `${id}:${pointerId}`;
		if (!activeTokens.delete(token)) {
			return;
		}
		repeatController.release(token);
		updatePressed();
	};
	const start = event => {
		event.preventDefault();
		const token = `${id}:${event.pointerId}`;
		if (activeTokens.has(token)) {
			return;
		}
		activeTokens.add(token);
		tryCapturePointer(button, event.pointerId);
		repeatController.press(token, direction);
		updatePressed();
	};
	const end = event => {
		event.preventDefault();
		releaseToken(event.pointerId);
	};
	const click = event => {
		event.preventDefault();
		if (event.detail === 0) {
			repeatController.tap(direction);
		}
	};
	const releaseAll = () => {
		for (const token of activeTokens) {
			repeatController.release(token);
		}
		activeTokens.clear();
		updatePressed();
	};
	button.addEventListener('pointerdown', start);
	button.addEventListener('click', click);
	for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
		button.addEventListener(type, end);
	}
	releasers.push(releaseAll);
	disposers.push(() => {
		button.removeEventListener('pointerdown', start);
		button.removeEventListener('click', click);
		for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
			button.removeEventListener(type, end);
		}
	});
	return true;
}
