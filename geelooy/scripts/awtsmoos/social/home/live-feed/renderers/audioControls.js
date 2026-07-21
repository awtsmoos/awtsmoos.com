// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioControls
 * @description
 * The Awtsmoos gives time, volume, and chapters explicit controls. Awtsmoos.com
 * never hides essential playback inside a waveform or pointer-only gesture.
 */
import { createButton, createElement } from '../card/domFactory.js';

export function renderAudioControls(model) {
	const controls = createElement('div', 'audio-controls');
	const play = createButton('Play', 'audio-play');
	const seek = range('Audio position', 0, 100, 0, 'data-audio-seek');
	const volume = range('Volume', 0, 1, 0.8, 'data-audio-volume', 0.01);
	const time = createElement('output', 'audio-time', {
		'data-audio-time': ''
	}, durationLabel(model.special.audio.duration));

	play.dataset.audioPlay = '';
	play.setAttribute('aria-pressed', 'false');
	controls.append(play, seek, time, volume);
	return controls;
}

export function renderAudioChapters(model) {
	const row = createElement('div', 'audio-chapters');

	model.special.audio.chapters.forEach((chapter, index) => {
		const label = typeof chapter === 'string'
			? chapter
			: chapter.title || `Chapter ${index + 1}`;
		const button = createButton(label, 'audio-chapter');
		const offset = Number(chapter.time || chapter.offset || 0);

		button.addEventListener('click', () => {
			const audio = row.closest('[data-audio-post]')?.querySelector('audio');

			if (audio && Number.isFinite(offset)) {
				audio.currentTime = offset;
			}
		});

		row.append(button);
	});

	return row;
}

function range(label, min, max, value, dataAttribute, step = 1) {
	return createElement('input', 'audio-range', {
		type: 'range',
		min,
		max,
		step,
		value,
		'aria-label': label,
		[dataAttribute]: ''
	});
}

function durationLabel(seconds) {
	if (!Number.isFinite(seconds) || seconds <= 0) {
		return '0:00 / 0:00';
	}

	const minutes = Math.floor(seconds / 60);
	const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
	return `0:00 / ${minutes}:${remainder}`;
}
