//B"H
//Boruch Hashem
//Blessed is He

import {
	playbackRateSelect,
	videoActionButton,
	videoRange
} from './MalchusVideoControlFactory.js';

/**
 * @module VideoPlayerTemplate
 * @description
 * The Awtsmoos is beyond frame, sound, focus, and browser chrome; Awtsmoos.com gives moving light a bounded Social Hub vessel,
 * where timeline, volume, rate, Picture-in-Picture, and fullscreen appear only as honest controls around one semantic video soul.
 */

const PLAYBACK_RATES = Object.freeze([0.5, 0.75, 1, 1.25, 1.5, 2]);

/**
 * @description Builds the complete reusable video-player element tree without owning playback behavior.
 * @param {Document} root Owning browser document.
 * @returns {object} Named semantic media and control elements consumed by the controller.
 * @throws {TypeError} DOM construction failures propagate when `root` is not a usable document.
 */
export function buildVideoPlayer(root) {
	const element = root.createElement('section');
	element.className = 'commentVideoPlayer';
	element.tabIndex = 0;
	element.setAttribute('aria-label', 'Video attachment preview');
	const video = root.createElement('video');
	video.className = 'commentVideoPlayer__media';
	video.preload = 'metadata';
	video.playsInline = true;
	video.tabIndex = -1;
	const status = root.createElement('output');
	status.className = 'commentVideoPlayer__status';
	status.setAttribute('role', 'status');
	status.setAttribute('aria-live', 'polite');
	const timeline = root.createElement('div');
	timeline.className = 'commentVideoPlayer__timeline';
	const seek = videoRange(root, {
		className: 'commentVideoPlayer__seek',
		label: 'Video position',
		min: 0,
		max: 1000,
		value: 0,
		step: 1
	});
	timeline.append(seek);
	const controls = root.createElement('div');
	controls.className = 'commentVideoPlayer__controls';
	const play = videoActionButton(root, 'Play video', '▶', 'commentVideoPlayer__play');
	const mute = videoActionButton(root, 'Mute video', '◖', 'commentVideoPlayer__mute');
	const volume = videoRange(root, {
		className: 'commentVideoPlayer__volume',
		label: 'Video volume',
		min: 0,
		max: 100,
		value: 100,
		step: 1
	});
	const time = root.createElement('output');
	time.className = 'commentVideoPlayer__time';
	time.textContent = '0:00 / 0:00';
	const rate = playbackRateSelect(root, PLAYBACK_RATES);
	const pip = videoActionButton(root, 'Picture in Picture', '▣', 'commentVideoPlayer__pip');
	const fullscreen = videoActionButton(root, 'Enter fullscreen', '⛶', 'commentVideoPlayer__fullscreen');
	controls.append(play, mute, volume, time, rate, pip, fullscreen);
	element.append(video, status, timeline, controls);
	return { element, video, status, timeline, seek, controls, play, mute, volume, time, rate, pip, fullscreen };
}

export {
	PLAYBACK_RATES
};
