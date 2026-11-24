//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoVoiceTakeControl
 * @description
 * The Awtsmoos lets the hands keep playing while the voice is gathered;
 * Awtsmoos.com puts one voice-take control on the piano surface itself —
 * no Studio visit required — under the same shared microphone law.
 */
import { AudioState } from '../audio.js';
import { MicCaptureSession } from '../recording/micCapture.js';
import { MIC_OUTPUT_MODE_KEY, normalizeOutputMode } from '../recording/micSafety.js';

let bound = false;
let capture = null;
let lastTake = null;
let playingSource = null;

/** Inserts the voice-take controls beside the Record Audio button (idempotent). */
export function ensureVoiceTakeControl() {
	if (bound || typeof document === 'undefined') return null;
	const anchor = document.querySelector('#record-audio-button') || document.querySelector('#mic-button');
	if (!anchor?.parentElement) return null;
	bound = true;
	const box = document.createElement('span');
	box.id = 'voice-take-controls';
	box.style.cssText = 'display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap';
	const record = button('🎙 Record Voice', 'voice-take-record');
	const play = button('▶ Take', 'voice-take-play');
	const save = button('⬇ WAV', 'voice-take-save');
	const studio = button('🎼 To Studio', 'voice-take-studio');
	const status = document.createElement('span');
	status.className = 'voice-take-status';
	status.setAttribute('role', 'status');
	status.style.cssText = 'font-size:12px;max-width:30em';
	play.disabled = save.disabled = studio.disabled = true;
	record.addEventListener('click', () => void toggleTake(record, status, [play, save, studio]));
	play.addEventListener('click', () => playTake(status));
	save.addEventListener('click', () => void saveTake(status));
	studio.addEventListener('click', () => void sendToStudio(status));
	box.append(record, play, save, studio, status);
	anchor.after(box);
	return box;
}

function mode() {
	try { return normalizeOutputMode(localStorage.getItem(MIC_OUTPUT_MODE_KEY)); }
	catch (_) { return 'speakers'; }
}

function monitorWanted() {
	return Boolean(document.querySelector('#mic-playback-checkbox')?.checked);
}

async function toggleTake(record, status, actions) {
	if (capture?.active) {
		const result = await capture.stop();
		capture = null;
		record.textContent = '🎙 Record Voice';
		if (result?.buffer && result.duration > 0.05) {
			lastTake = result.buffer;
			actions.forEach(action => { action.disabled = false; });
			status.textContent = `Voice take kept (${result.duration.toFixed(1)}s) — play it, save it, or send it to the Studio.`
				+ (result.feedbackCut ? ' Monitoring was cut by the feedback guard during the take.' : '');
		} else status.textContent = 'That take was too short to keep.';
		return;
	}
	if (!AudioState.context || !AudioState.masterGain) {
		status.textContent = 'Start the piano first, then record your voice.';
		return;
	}
	capture = new MicCaptureSession({
		onFeedbackCut: () => { status.textContent = 'Feedback stopped — monitoring muted; the take kept recording.'; }
	});
	record.disabled = true;
	try {
		const speakers = mode() === 'speakers';
		await capture.start({
			context: AudioState.context,
			mode: mode(),
			monitor: monitorWanted(),
			monitorDestination: AudioState.masterGain,
			autoGainControl: true,
			duckGainNode: speakers ? AudioState.masterGain : null,
			duckDb: speakers ? -6 : 0
		});
		record.textContent = '■ Stop Voice';
		status.textContent = speakers
			? 'Recording voice — keep playing! Playback is lowered −6 dB and monitoring is off on speakers.'
			: 'Recording voice — keep playing!';
	} catch (error) {
		capture = null;
		status.textContent = error?.message || 'Microphone could not start.';
	} finally {
		record.disabled = false;
	}
}

function playTake(status) {
	if (!lastTake || !AudioState.context) return;
	playingSource?.stop();
	playingSource = AudioState.context.createBufferSource();
	playingSource.buffer = lastTake;
	playingSource.connect(AudioState.masterGain);
	playingSource.start();
	status.textContent = 'Playing your voice take…';
}

async function takeWavBlob() {
	const { encodeMultitrackWav } = await import('../workstation/song/multitrack/multitrackWavEncoder.js');
	return new Blob([encodeMultitrackWav(lastTake, { bitsPerSample: 16 })], { type: 'audio/wav' });
}

async function saveTake(status) {
	if (!lastTake) return;
	const { downloadBlob } = await import('../recording/download.js');
	downloadBlob(await takeWavBlob(), `BH-Voice-Take-${Date.now()}.wav`);
	status.textContent = 'Voice take downloaded as WAV.';
}

async function sendToStudio(status) {
	if (!lastTake) return;
	try {
		const { editRecordingInStudio } = await import('../recording/editInStudio.js');
		const blob = await takeWavBlob();
		await editRecordingInStudio({ blob, filename: `BH-Voice-Take-${Date.now()}.wav` });
		status.textContent = 'Voice take is in the Studio as a clip on its own track.';
	} catch (error) {
		status.textContent = error?.message || 'Could not open the Studio.';
	}
}

function button(label, className) {
	const element = document.createElement('button');
	element.type = 'button';
	element.className = className;
	element.textContent = label;
	element.style.cssText = 'min-height:40px;min-width:44px';
	return element;
}
