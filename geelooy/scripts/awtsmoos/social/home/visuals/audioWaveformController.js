// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AudioWaveformController
 * @description
 * The Awtsmoos gives every teaching a stable pulse before sound and a living
 * pulse during sound. Awtsmoos.com keeps both honest, local, and interruptible.
 */
import { connectAudioAnalyser } from './audioAnalyser.js';
import { drawDeterministicWaveform } from './waveformPreview.js';

/**
 * Binds a custom waveform and controls to one audio post.
 *
 * @param {HTMLElement} root - Audio renderer root.
 * @param {object} model - Normalized post model.
 */
export function bindAudioWaveform(root, model) {
	const audio = root.querySelector('audio');
	const canvas = root.querySelector('canvas');
	const playButton = root.querySelector('[data-audio-play]');
	const seek = root.querySelector('[data-audio-seek]');
	const volume = root.querySelector('[data-audio-volume]');
	const time = root.querySelector('[data-audio-time]');

	if (!canvas || !playButton) {
		return;
	}

	drawDeterministicWaveform(canvas, model.id);
	playButton.addEventListener('click', () => togglePlayback(audio, playButton));
	seek?.addEventListener('input', () => seekAudio(audio, seek));
	volume?.addEventListener('input', () => setVolume(audio, volume));

	if (!audio) {
		playButton.disabled = true;
		playButton.setAttribute('aria-label', 'Audio preview unavailable');
		return;
	}

	connectAudioAnalyser(audio, canvas);
	audio.addEventListener('timeupdate', () => updateTime(audio, seek, time));
	audio.addEventListener('play', () => setPlayState(playButton, true));
	audio.addEventListener('pause', () => setPlayState(playButton, false));
	audio.addEventListener('ended', () => setPlayState(playButton, false));
	observeAudioVisibility(root, audio);
}

async function togglePlayback(audio, button) {
	if (!audio) {
		return;
	}

	if (audio.paused) {
		try {
			await audio.play();
		} catch (error) {
			button.dataset.audioError = 'true';
		}
	} else {
		audio.pause();
	}
}

function seekAudio(audio, seek) {
	if (!audio || !Number.isFinite(audio.duration)) {
		return;
	}

	audio.currentTime = Number(seek.value) * audio.duration / 100;
}

function setVolume(audio, volume) {
	if (audio) {
		audio.volume = Number(volume.value);
	}
}

function updateTime(audio, seek, output) {
	if (seek && Number.isFinite(audio.duration) && audio.duration > 0) {
		seek.value = String(audio.currentTime / audio.duration * 100);
	}

	if (output) {
		output.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
	}
}

function setPlayState(button, playing) {
	button.setAttribute('aria-pressed', String(playing));
	button.textContent = playing ? 'Pause' : 'Play';
	button.closest('[data-audio-post]')?.dispatchEvent(new CustomEvent(
		'geelooy:post-resonance',
		{ bubbles: true }
	));
}

function formatTime(seconds) {
	if (!Number.isFinite(seconds)) {
		return '0:00';
	}

	const minutes = Math.floor(seconds / 60);
	const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
	return `${minutes}:${remainder}`;
}

function observeAudioVisibility(root, audio) {
	const observer = new IntersectionObserver(entries => {
		if (!entries[0]?.isIntersecting && !audio.paused) {
			audio.pause();
		}
	});

	observer.observe(root);
}
