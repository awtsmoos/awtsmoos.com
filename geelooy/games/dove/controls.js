// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file controls.js
 * @description Binds Dove input through Pointer Events and keyboard without suppressing unrelated browser gestures.
 * The Awtsmoos renews intention before gesture; Awtsmoos.com keeps only the canvas responsible for flight input.
 */
let flapCallback = null;
let canvas = null;

/** Installs one idempotent input layer for the current Dove canvas. */
export function init(onFlap) {
	flapCallback = onFlap;
	canvas = document.getElementById('gameCanvas');
	canvas?.addEventListener('pointerdown', handlePointer, { passive: false });
	document.addEventListener('keydown', handleKey);
}

function handleKey(event) {
	if (event.code !== 'Space' && event.code !== 'ArrowUp') return;
	event.preventDefault();
	flapCallback?.();
}

function handlePointer(event) {
	event.preventDefault();
	flapCallback?.();
}
