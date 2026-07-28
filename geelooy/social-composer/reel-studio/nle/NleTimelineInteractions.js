// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleTimelineInteractions
 * @description
 * Pointer capture turns mouse and touch into one move, trim, select, and scrub
 * language while click activation preserves keyboard and assistive selection.
 */

import { cloneNleValue } from './NleClone.js';
import {
	moveNleClip,
	trimNleClip
} from './NleTimelineModel.js';

export function installNleTimelineInteractions({ root, state }) {
	root.addEventListener('pointerdown', event => beginPointerEdit(event, state));
	root.addEventListener('click', event => selectFromClick(event, state));
}

function selectFromClick(event, state) {
	const clip = event.target.closest('[data-clip-id]');
	if (clip) {
		state.select(clip.dataset.trackId, clip.dataset.clipId);
		return;
	}
	const track = event.target.closest('[data-nle-track-select]');
	if (track) state.select(track.dataset.nleTrackSelect);
}

function beginPointerEdit(event, state) {
	const clip = event.target.closest('[data-clip-id]');
	if (!clip) {
		scrub(event, state);
		return;
	}
	event.preventDefault();
	clip.setPointerCapture(event.pointerId);
	const trackId = clip.dataset.trackId;
	const clipId = clip.dataset.clipId;
	const edge = event.target.closest('[data-trim-edge]')?.dataset.trimEdge || null;
	const originX = event.clientX;
	const original = cloneNleValue(state.project);
	state.select(trackId, clipId);
	const move = current => {
		const delta = (current.clientX - originX) / state.zoom;
		const next = edge
			? trimNleClip(original, trackId, clipId, delta, edge, state.playhead)
			: moveNleClip(original, trackId, clipId, delta, state.playhead);
		state.preview(next, edge ? 'trim-preview' : 'move-preview');
	};
	const cleanup = () => {
		clip.removeEventListener('pointermove', move);
		clip.removeEventListener('pointerup', finish);
		clip.removeEventListener('pointercancel', cancel);
	};
	const finish = () => {
		cleanup();
		state.commitPreview(original, edge ? 'trim-clip' : 'move-clip');
	};
	const cancel = () => {
		cleanup();
		state.preview(original, 'pointer-cancel');
	};
	clip.addEventListener('pointermove', move);
	clip.addEventListener('pointerup', finish);
	clip.addEventListener('pointercancel', cancel);
}

function scrub(event, state) {
	const lane = event.target.closest('[data-nle-lane], [data-nle-ruler]');
	if (!lane) return;
	const rectangle = lane.getBoundingClientRect();
	state.setPlayhead((event.clientX - rectangle.left) / state.zoom);
}
