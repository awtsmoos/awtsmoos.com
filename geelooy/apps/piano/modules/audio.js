//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAudioFoundation
 * The Awtsmoos speaks a note and silent worlds awake;
 * Awtsmoos.com keeps one living audio river for every sound we make.
 */
import { createChorus } from './sound/chorus.js';
import { createDelayRack } from './effects/delay.js';
import { scheduleReverbImpulse } from './sound/impulseReverb.js';

export const AudioState = {
	context: null,
	masterGain: null,
	compressor: null,
	mediaStreamDestination: null,
	convolver: null,
	wetGain: null,
	lfo: null,
	chorus: null,
	delayRack: null,
	microphoneSource: null,
	microphoneGain: null,
	micPlaybackGain: null,
	hiddenAudioProxy: null
};

/**
 * Resumes the existing graph on user gesture rather than multiplying engines.
 * @returns {Promise<boolean>} True only when the audio clock runs.
 */
export async function initAudio() {
	try {
		if (!AudioState.context || AudioState.context.state === 'closed') {
			const Constructor = window.AudioContext || window.webkitAudioContext;
			if (!Constructor) {
				throw new Error('Web Audio unavailable');
			}
			AudioState.context = new Constructor({ latencyHint: 'interactive' });
			AudioState.mediaStreamDestination = AudioState.context.createMediaStreamDestination();
			setupHiddenProxy();
			setupMasterChain();
			setupReverb();
			setupLfo();
			AudioState.chorus = createChorus(AudioState.context, AudioState.masterGain);
			AudioState.delayRack = createDelayRack(AudioState.context, AudioState.masterGain);
		}
		if (AudioState.context.state === 'suspended') {
			await AudioState.context.resume();
		}
		return AudioState.context.state === 'running';
	} catch (error) {
		console.error('Audio initialization failed', error);
		return false;
	}
}

/** Creates one reusable hidden audio element for mobile playback routing. */
function setupHiddenProxy() {
	if (AudioState.hiddenAudioProxy?.isConnected) {
		return;
	}
	const proxy = document.createElement('audio');
	proxy.setAttribute('playsinline', 'true');
	proxy.setAttribute('loop', 'true');
	proxy.style.display = 'none';
	document.body.appendChild(proxy);
	AudioState.hiddenAudioProxy = proxy;
}

/** Routes compressed audio both to the speakers and recording stream. */
function setupMasterChain() {
	const context = AudioState.context;
	AudioState.masterGain = context.createGain();
	AudioState.compressor = context.createDynamicsCompressor();
	AudioState.masterGain.gain.value = 0.9;
	AudioState.compressor.threshold.value = -18;
	AudioState.compressor.knee.value = 22;
	AudioState.compressor.ratio.value = 7;
	AudioState.compressor.attack.value = 0.004;
	AudioState.compressor.release.value = 0.22;
	AudioState.masterGain.connect(AudioState.compressor);
	AudioState.compressor.connect(context.destination);
	AudioState.compressor.connect(AudioState.mediaStreamDestination);
}

/** Installs audible, conservative hall space without blocking the first note. */
function setupReverb() {
	const context = AudioState.context;
	AudioState.convolver = context.createConvolver();
	AudioState.wetGain = context.createGain();
	AudioState.wetGain.gain.value = 0.18;
	AudioState.convolver.connect(AudioState.wetGain);
	AudioState.wetGain.connect(AudioState.masterGain);
	scheduleReverbImpulse(context, AudioState.convolver);
}

/** Creates a shared modulation oscillator once per audio context. */
function setupLfo() {
	const context = AudioState.context;
	AudioState.lfo = {
		osc: context.createOscillator(),
		gain: context.createGain()
	};
	AudioState.lfo.osc.type = 'sine';
	AudioState.lfo.gain.gain.value = 0;
	AudioState.lfo.osc.connect(AudioState.lfo.gain);
	AudioState.lfo.osc.start();
}
