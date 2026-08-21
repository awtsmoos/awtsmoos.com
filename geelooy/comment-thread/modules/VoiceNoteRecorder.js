//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VoiceNoteRecorder
 * @description A human voice rises as breath and becomes a durable vessel without losing its source;
 * Awtsmoos.com makes support, permission, recording, upload, success, and retry states explicit along the course.
 */
import { uploadMalchusCommentAsset } from './AssetVaultClient.js';

export function createBinahVoiceRecorder(document, config, store) {
	const root = document.createElement('div');
	const button = document.createElement('button');
	const status = document.createElement('small');
	const supported = Boolean(globalThis.MediaRecorder && navigator.mediaDevices?.getUserMedia);
	let recorder = null;
	let stream = null;
	let chunks = [];
	root.className = 'threadVoiceRecorder';
	button.type = 'button';
	button.className = 'soft-btn threadVoiceButton';
	button.textContent = 'Record voice';
	button.disabled = !supported;
	status.className = 'threadFieldStatus';
	status.setAttribute('aria-live', 'polite');
	status.textContent = supported
		? 'Voice recording is optional.'
		: 'Voice recording is not supported in this browser. You can still attach an audio file.';
	button.addEventListener('click', () => handleVoiceClick({ button, status, config, store, session: {
		get recorder() { return recorder; },
		set recorder(value) { recorder = value; },
		get stream() { return stream; },
		set stream(value) { stream = value; },
		get chunks() { return chunks; },
		set chunks(value) { chunks = value; }
	} }));
	root.append(button, status);
	return root;
}

async function handleVoiceClick({ button, status, config, store, session }) {
	if (session.recorder?.state === 'recording') {
		session.recorder.stop();
		button.disabled = true;
		status.textContent = 'Preparing and uploading your voice note…';
		return;
	}
	try {
		session.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		session.chunks = [];
		session.recorder = new MediaRecorder(session.stream);
		session.recorder.addEventListener('dataavailable', event => {
			if (event.data.size) session.chunks.push(event.data);
		});
		session.recorder.addEventListener('stop', () => finalizeVoice({ config, store, status, button, session }));
		session.recorder.start();
		button.textContent = 'Stop recording';
		status.textContent = 'Recording. Tap Stop recording when you are finished.';
	} catch (error) {
		stopStream(session.stream);
		status.textContent = permissionMessage(error);
		button.textContent = 'Try voice again';
	}
}

async function finalizeVoice({ config, store, status, button, session }) {
	stopStream(session.stream);
	const mime = session.recorder?.mimeType || 'audio/webm';
	const blob = new Blob(session.chunks, { type: mime });
	if (!blob.size) {
		status.textContent = 'No audio was captured. You can try recording again.';
		return resetButton(button);
	}
	const file = new File([blob], `voice-${Date.now()}.webm`, { type: mime });
	try {
		const manifest = await uploadMalchusCommentAsset(config, file);
		store.addAsset({ ...manifest, role: 'voice-note' });
		status.textContent = 'Voice note attached and ready to send.';
	} catch (error) {
		status.textContent = `${error.message || 'Voice upload failed.'} You can try again.`;
	} finally {
		resetButton(button);
	}
}

function stopStream(stream) {
	stream?.getTracks().forEach(track => track.stop());
}

function resetButton(button) {
	button.disabled = false;
	button.textContent = 'Record another voice note';
}

function permissionMessage(error) {
	if (error?.name === 'NotAllowedError') return 'Microphone permission was denied. Allow access or attach an audio file instead.';
	if (error?.name === 'NotFoundError') return 'No microphone was found. You can attach an audio file instead.';
	return error?.message || 'Voice recording could not start. You can try again or attach an audio file.';
}
