//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoVoiceTakeControl
 * @description
 * The Awtsmoos lets the hands keep playing while the voice is gathered;
 * Awtsmoos.com puts one voice-take control on the piano surface itself —
 * no Studio visit required — under the same shared microphone law.
 * One take, one final sound: the saved take MIXES the voice with the
 * piano played during it, and the live voice also feeds the main
 * Record Audio stream, so whichever record button the player used,
 * the final audio holds both the singing and the playing.
 */
import { AudioState } from '../audio.js';
import { MicCaptureSession, StreamPcmTap } from '../recording/micCapture.js';
import { MIC_OUTPUT_MODE_KEY, normalizeOutputMode } from '../recording/micSafety.js';

let bound = false;
let capture = null;
let masterTap = null;
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
	const meter = document.createElement('span');
	meter.className = 'voice-take-meter';
	meter.setAttribute('aria-label', 'Microphone level');
	meter.style.cssText = 'display:none;width:64px;height:10px;border:1px solid currentColor;border-radius:5px;overflow:hidden;vertical-align:middle';
	const meterFill = document.createElement('span');
	meterFill.className = 'voice-take-meter-fill';
	meterFill.style.cssText = 'display:block;height:100%;width:0%;background:#d33;transition:width 60ms linear';
	meter.append(meterFill);
	const status = document.createElement('span');
	status.className = 'voice-take-status';
	status.setAttribute('role', 'status');
	status.style.cssText = 'font-size:12px;max-width:30em';
	play.disabled = save.disabled = studio.disabled = true;
	record.addEventListener('click', () => void toggleTake(record, status, meterFill, meter, [play, save, studio]));
	play.addEventListener('click', () => playTake(status));
	save.addEventListener('click', () => void saveTake(status));
	studio.addEventListener('click', () => void sendToStudio(status));
	box.append(record, meter, play, save, studio, status);
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

function bufferRms(buffer) {
	if (!buffer?.length) return 0;
	const data = buffer.getChannelData(0);
	let sum = 0;
	for (const value of data) sum += value * value;
	return Math.sqrt(sum / data.length);
}

/**
 * Mixes the voice buffer and the piano (master tap) buffer onto one
 * timeline, aligned by their audio-clock start times.
 * @param {AudioContext} context - Live context for the output buffer.
 * @param {Object} voice - {buffer, startContextTime} mic take.
 * @param {Object} piano - {buffer, startContextTime} master tap.
 * @returns {AudioBuffer} Voice + piano, sample-aligned.
 */
function mixTake(context, voice, piano) {
	if (!piano?.buffer) return voice.buffer;
	const sampleRate = context.sampleRate;
	const start = Math.min(voice.startContextTime, piano.startContextTime);
	const end = Math.max(
		voice.startContextTime + voice.buffer.duration,
		piano.startContextTime + piano.buffer.duration);
	const frames = Math.max(1, Math.ceil((end - start) * sampleRate));
	const channels = Math.max(voice.buffer.numberOfChannels, piano.buffer.numberOfChannels);
	const mixed = context.createBuffer(channels, frames, sampleRate);
	for (const part of [piano, voice]) {
		const offset = Math.round((part.startContextTime - start) * sampleRate);
		for (let channel = 0; channel < channels; channel++) {
			const target = mixed.getChannelData(channel);
			const source = part.buffer.getChannelData(Math.min(channel, part.buffer.numberOfChannels - 1));
			for (let i = 0; i < source.length && offset + i < frames; i++) {
				const index = offset + i;
				if (index >= 0) target[index] += source[i];
			}
		}
	}
	for (let channel = 0; channel < channels; channel++) {
		const data = mixed.getChannelData(channel);
		for (let i = 0; i < data.length; i++) data[i] = Math.max(-1, Math.min(1, data[i]));
	}
	return mixed;
}

async function toggleTake(record, status, meterFill, meter, actions) {
	if (capture?.active) {
		const result = await capture.stop();
		capture = null;
		const piano = masterTap ? await masterTap.stop() : null;
		masterTap = null;
		meter.style.display = 'none';
		meterFill.style.width = '0%';
		record.textContent = '🎙 Record Voice';
		if (result?.buffer && result.duration > 0.05) {
			const micRms = bufferRms(result.buffer);
			lastTake = mixTake(AudioState.context, result, piano);
			actions.forEach(action => { action.disabled = false; });
			status.textContent = `Voice take kept (${result.duration.toFixed(1)}s) — your voice and piano together: play it, save it, or send it to the Studio.`
				+ (micRms < 0.004
					? ` ⚠ WARNING: your voice was barely picked up (level ${micRms.toFixed(3)}). Check the microphone, move closer, and try again — do not trust this take.`
					: '')
				+ (result.feedbackCut ? ' Monitoring was cut by the feedback guard during the take.' : '');
		} else status.textContent = 'That take was too short to keep.';
		return;
	}
	if (!AudioState.context || !AudioState.masterGain) {
		status.textContent = 'Start the piano first, then record your voice.';
		return;
	}
	capture = new MicCaptureSession({
		onFeedbackCut: () => { status.textContent = 'Feedback stopped — monitoring muted; the take kept recording.'; },
		onLevel: ({ rms, peak }) => {
			const level = Math.min(1, Math.max(rms * 3, peak * 0.7));
			meterFill.style.width = `${Math.round(level * 100)}%`;
			meterFill.style.background = peak >= 0.98 ? '#d33' : '#2a2';
		}
	});
	record.disabled = true;
	try {
		const speakers = mode() === 'speakers';
		// Start the piano tap first: even the notes played while the
		// permission prompt is open belong to the take.
		if (AudioState.mediaStreamDestination?.stream) {
			masterTap = new StreamPcmTap(AudioState.context, AudioState.mediaStreamDestination.stream);
			masterTap.start();
		}
		await capture.start({
			context: AudioState.context,
			mode: mode(),
			monitor: monitorWanted(),
			monitorDestination: AudioState.masterGain,
			recordDestination: AudioState.mediaStreamDestination,
			autoGainControl: true,
			duckGainNode: speakers ? AudioState.masterGain : null,
			duckDb: speakers ? -6 : 0
		});
		meter.style.display = 'inline-block';
		record.textContent = '■ Stop Voice';
		status.textContent = speakers
			? '● Recording voice + piano — keep playing and singing! Watch the mic level move. Playback is lowered −6 dB and monitoring is off on speakers.'
			: '● Recording voice + piano — keep playing and singing! Watch the mic level move.';
	} catch (error) {
		capture = null;
		if (masterTap) { await masterTap.stop().catch(() => {}); masterTap = null; }
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
	status.textContent = 'Playing your take — voice and piano together…';
}

async function takeWavBlob() {
	const { encodeMultitrackWav } = await import('../workstation/song/multitrack/multitrackWavEncoder.js');
	return new Blob([encodeMultitrackWav(lastTake, { bitsPerSample: 16 })], { type: 'audio/wav' });
}

async function saveTake(status) {
	if (!lastTake) return;
	const { downloadBlob } = await import('../recording/download.js');
	downloadBlob(await takeWavBlob(), `BH-Voice-Piano-Take-${Date.now()}.wav`);
	status.textContent = 'Take downloaded as WAV — voice and piano together.';
}

async function sendToStudio(status) {
	if (!lastTake) return;
	try {
		const { editRecordingInStudio } = await import('../recording/editInStudio.js');
		const blob = await takeWavBlob();
		await editRecordingInStudio({ blob, filename: `BH-Voice-Piano-Take-${Date.now()}.wav` });
		status.textContent = 'Your take — voice and piano together — is in the Studio as a clip on its own track.';
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
