//B"H
//Boruch Hashem
//Blessed be He

import { tryCapturePointer } from './pointer-capture.js';

import { bindHorizontalControls } from './horizontal-controls.js';

/**
 * @file controls.js
 * @description Binds explicit pointer-accessible Tetris buttons to semantic actions and exposes deterministic held-action release for lifecycle transitions.
 * Awtsmoos.com keeps required mobile mechanics visible as ordinary buttons rather than hidden multi-touch gestures, while pointer capture prevents lost release events.
 *
 * Architectural invariants:
 * - Left/Right and Soft Drop are explicit held controls; every successful press owns a matching deterministic release.
 * - Pause/background/failure/disposal may call `release()` without waiting for pointerup, keyup, or pointer-capture recovery.
 * - One-shot controls remain native buttons, preserving keyboard activation and accessibility semantics.
 * - Binding owns no gameplay state and can be recreated safely for every page generation.
 */
export function bindTetrisControls(root, options) {
	const disposers = [];
	const releasers = [];
	const horizontal = bindHorizontalControls(
		root,
		options.horizontalRepeat
	);
	bindPress(root, 'rotate', () => options.onAction('rotate'), disposers);
	bindPress(root, 'hard-drop', () => options.onAction('hard_drop'), disposers);
	bindPress(root, 'hold-button', () => options.onAction('hold'), disposers);
	bindHold(
		root,
		'soft-drop',
		held => options.onAction(held ? 'soft_drop_start' : 'soft_drop_end'),
		disposers,
		releasers
	);
	const release = () => {
		horizontal.release();
		for (const releaseHeld of releasers) {
			releaseHeld();
		}
	};
	const dispose = () => {
		release();
		horizontal.dispose();
		for (const removeListener of disposers.splice(0)) {
			removeListener();
		}
	};
	return Object.freeze({ release, dispose });
}

function bindPress(root, id, callback, disposers) {
	const button = root.querySelector(`#${id}`);
	if (!button) {
		return;
	}
	const click = event => {
		event.preventDefault();
		callback();
	};
	button.addEventListener('click', click);
	disposers.push(() => {
		button.removeEventListener('click', click);
	});
}

function bindHold(root, id, callback, disposers, releasers) {
	const button = root.querySelector(`#${id}`);
	if (!button) {
		return;
	}
	let held = false;
	const release = () => {
		if (!held) {
			return;
		}
		held = false;
		button.setAttribute('aria-pressed', 'false');
		callback(false);
	};
	const start = event => {
		event.preventDefault();
		if (held) {
			return;
		}
		held = true;
		tryCapturePointer(button, event.pointerId);
		button.setAttribute('aria-pressed', 'true');
		callback(true);
	};
	const end = event => {
		event.preventDefault();
		release();
	};
	button.addEventListener('pointerdown', start);
	for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
		button.addEventListener(type, end);
	}
	releasers.push(release);
	disposers.push(() => {
		button.removeEventListener('pointerdown', start);
		for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
			button.removeEventListener(type, end);
		}
	});
}
