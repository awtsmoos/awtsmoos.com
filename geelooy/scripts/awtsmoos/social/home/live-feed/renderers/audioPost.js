// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioPostRenderer
 * @description
 * The Awtsmoos gives teaching a visible pulse, truthful controls, and readable
 * transcript. Awtsmoos.com never makes playback depend on decorative animation.
 */
import { createElement } from '../card/domFactory.js';
import { bindAudioWaveform } from '../../visuals/audioWaveformController.js';
import { renderAudioChapters, renderAudioControls } from './audioControls.js';
import {
	renderAudioComment,
	renderAudioTopics,
	renderAudioTranscript
} from './audioSupplement.js';

/**
 * Renders a custom accessible audio teaching.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement} Audio teaching section.
 */
export function renderAudioPost(model) {
	const section = createElement('section', 'post-content post-audio', {
		'data-audio-post': ''
	});
	const player = createElement('div', 'audio-player');
	const waveform = createElement('canvas', 'audio-waveform', {
		width: '640',
		height: '92',
		'aria-label': 'Audio waveform preview'
	});

	player.append(waveform, renderAudioControls(model));

	if (model.special.audio.url) {
		player.append(createElement('audio', 'audio-native', {
			src: model.special.audio.url,
			preload: 'metadata'
		}));
	}

	section.append(
		player,
		renderAudioChapters(model),
		renderAudioTopics(model),
		renderAudioTranscript(model)
	);

	const comment = renderAudioComment(model);

	if (comment) {
		section.append(comment);
	}

	queueMicrotask(() => bindAudioWaveform(section, model));
	return section;
}
