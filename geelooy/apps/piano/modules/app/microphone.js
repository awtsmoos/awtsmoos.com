//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppMicrophone
 * @description
 * The Awtsmoos lets an outside voice enter the graph without confusing it with the instrument's own tone;
 * Awtsmoos.com owns microphone creation and return here so permission, playback, and recording paths remain known.
 * The shared microphone law (modules/recording/micSafety.js) governs this
 * surface exactly as it governs the Studio: monitoring is off by default,
 * impossible on speakers, and cut by the feedback guard if the room howls.
 */

import { AudioState } from '../audio.js';
import {
	FeedbackGuard,
	MIC_OUTPUT_MODE_KEY,
	buildMicConstraints,
	normalizeOutputMode,
	resolveMonitorEnabled
} from '../recording/micSafety.js';
import { ensureVoiceTakeControl } from './voiceTakeControl.js';

const MONITOR_KEY = 'awtsmoos.micMonitor';
const guard = new FeedbackGuard();
let guardTimer = null;
let guardAnalyser = null;

/** Current session output mode, shared with the Studio. */
export function currentMicMode() {
	try { return normalizeOutputMode(localStorage.getItem(MIC_OUTPUT_MODE_KEY)); }
	catch (_) { return 'speakers'; }
}

if (typeof document !== 'undefined') {
	queueMicrotask(() => { ensureMicSafetyControls(); ensureVoiceTakeControl(); });
}

/** Adds the output-mode selector and feedback notice beside the mic controls (idempotent). */
export function ensureMicSafetyControls() {
	const button = document.querySelector('#mic-button');
	if (!button || document.querySelector('#mic-output-mode')) return null;
	const mode = document.createElement('select');
	mode.id = 'mic-output-mode';
	mode.setAttribute('aria-label', 'Listening on headphones or speakers');
	mode.append(new Option('🎧 Headphones', 'headphones'), new Option('🔊 Speakers', 'speakers'));
	mode.value = currentMicMode();
	mode.style.cssText = 'min-height:40px;margin-inline-start:6px';
	mode.addEventListener('change', () => {
		try { localStorage.setItem(MIC_OUTPUT_MODE_KEY, mode.value); } catch (_) { /* Private mode. */ }
		applyMonitorGate();
		setMicNotice(mode.value === 'speakers'
			? 'Speakers: “Hear Self” is forced off — your voice through the speakers would feed back into the mic.'
			: 'Headphones: “Hear Self” may be used; the feedback guard still watches.');
	});
	const notice = document.createElement('span');
	notice.id = 'mic-feedback-notice';
	notice.setAttribute('role', 'alert');
	notice.style.cssText = 'display:block;font-size:12px;max-width:34em';
	button.after(mode, notice);
	const checkbox = document.querySelector('#mic-playback-checkbox');
	if (checkbox) {
		let stored = null;
		try { stored = localStorage.getItem(MONITOR_KEY); } catch (_) { /* Private mode. */ }
		if (stored === null) checkbox.checked = false; // Monitoring starts OFF until chosen.
		checkbox.addEventListener('change', () => {
			try { localStorage.setItem(MONITOR_KEY, checkbox.checked ? '1' : '0'); } catch (_) { /* Private mode. */ }
			if (checkbox.checked) guard.reset();
			applyMonitorGate();
		});
	}
	applyMonitorGate();
	return mode;
}

function setMicNotice(message) {
	const notice = document.querySelector('#mic-feedback-notice');
	if (notice) notice.textContent = message || '';
}

/** Applies the shared gate to the live monitor gain, if the mic is on. */
function applyMonitorGate() {
	const checkbox = document.querySelector('#mic-playback-checkbox');
	const wanted = Boolean(checkbox?.checked);
	const effective = resolveMonitorEnabled(wanted, currentMicMode());
	if (checkbox && wanted && !effective)
		setMicNotice('“Hear Self” is off on speakers — it would feed back into the microphone. Switch to 🎧 Headphones to use it.');
	if (AudioState.micPlaybackGain && AudioState.context)
		AudioState.micPlaybackGain.gain.setTargetAtTime(effective ? 1 : 0, AudioState.context.currentTime, 0.02);
	return effective;
}

/**
 * @description Toggles microphone capture, requesting permission only when enabling the input graph.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {Promise<void>} Resolves after microphone state has been updated.
 */
export async function toggleMic(elements) {
	ensureMicSafetyControls();
	ensureVoiceTakeControl();
	if (AudioState.microphoneSource) {
		disableMic(elements);
		return;
	}
	try {
		await enableMic(elements);
	} catch (error) {
		alert(error?.message || 'Mic Access Denied');
	}
}

/**
 * @description Creates microphone recording and optional monitor branches inside the shared audio graph.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {Promise<void>} Resolves after the microphone graph is active.
 */
async function enableMic(elements) {
	const context = AudioState.context;
	if (!context) throw new Error('Start the piano before enabling the microphone.');
	if (context.state === 'suspended') await context.resume();
	const stream = await navigator.mediaDevices.getUserMedia(buildMicConstraints(currentMicMode()));
	AudioState.microphoneSource = context.createMediaStreamSource(stream);
	AudioState.microphoneGain = context.createGain();
	AudioState.micPlaybackGain = context.createGain();
	AudioState.microphoneGain.gain.value = Number.parseFloat(elements.micVolumeSlider.value);
	AudioState.microphoneGain.connect(AudioState.mediaStreamDestination);
	AudioState.microphoneGain.connect(AudioState.micPlaybackGain);
	AudioState.micPlaybackGain.connect(AudioState.masterGain);
	AudioState.microphoneSource.connect(AudioState.microphoneGain);
	guardAnalyser = context.createAnalyser();
	guardAnalyser.fftSize = 2048;
	AudioState.microphoneSource.connect(guardAnalyser); // Analysis only — never an output.
	applyMonitorGate();
	startGuardWatch();
	elements.micButton.classList.add('mic-active');
	elements.micButton.textContent = 'Disable Mic';
	elements.micVolumeSlider.disabled = false;
}

/** Polls the analyser; on a feedback cut only the monitor path dies. */
function startGuardWatch() {
	stopGuardWatch();
	const data = new Float32Array(2048);
	guardTimer = setInterval(() => {
		if (!guardAnalyser || !AudioState.micPlaybackGain) return;
		guardAnalyser.getFloatTimeDomainData(data);
		let sum = 0;
		let peak = 0;
		for (const value of data) { sum += value * value; peak = Math.max(peak, Math.abs(value)); }
		const monitoring = AudioState.micPlaybackGain.gain.value > 0.05;
		const verdict = guard.feed({ rms: Math.sqrt(sum / data.length), peak, monitoring, nowMs: performance.now() });
		if (verdict === 'cut') {
			AudioState.micPlaybackGain.gain.value = 0;
			const checkbox = document.querySelector('#mic-playback-checkbox');
			if (checkbox) checkbox.checked = false;
			setMicNotice('Feedback stopped — “Hear Self” was muted. Your microphone and recordings were not touched. Use headphones or move from the speakers, then tick “Hear Self” to retry.');
		}
	}, 40);
}

function stopGuardWatch() {
	if (guardTimer !== null) clearInterval(guardTimer);
	guardTimer = null;
}

/**
 * @description Stops microphone tracks, disconnects its source, and restores the disabled microphone UI state.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
function disableMic(elements) {
	stopGuardWatch();
	AudioState.microphoneSource.mediaStream.getTracks().forEach((track) => {
		track.stop();
	});
	AudioState.microphoneSource.disconnect();
	guardAnalyser?.disconnect();
	guardAnalyser = null;
	AudioState.microphoneGain?.disconnect();
	AudioState.micPlaybackGain?.disconnect();
	AudioState.microphoneSource = null;
	AudioState.microphoneGain = null;
	AudioState.micPlaybackGain = null;
	elements.micButton.classList.remove('mic-active');
	elements.micButton.textContent = 'Enable Mic';
	elements.micVolumeSlider.disabled = true;
}
