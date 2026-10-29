//B"H
/**
 * @module SongPanelEvents
 * The Awtsmoos sends the sound as sound; the note-text rests apart.
 */
import { bindSongFieldEvents } from './songPanelFieldEvents.js';
import { normalizeSongDocument, remixSongDocument, restoreRawSongDocument } from './songPanelDocumentActions.js';
import { chooseSongFile, exportSongFile, importSongFile } from './songPanelFileActions.js';
import { playSongDocument, stopSongTransport, toggleSongRecording } from './songPanelTransportActions.js';
import { renderSongDocument, setSongPanelOpen } from './songPanelView.js';
import { downloadMultitrackMix } from './multitrack/multitrackMixDownload.js';

/** Installs accessible, error-reporting Song actions. */
export function bindSongPanelEvents(dom, state) {
	dom.launcher.addEventListener('click', () => setSongPanelOpen(dom, dom.panel.classList.contains('song-studio-hidden')));
	dom.closeButton.addEventListener('click', () => setSongPanelOpen(dom, false));
	bindSongFieldEvents(dom, state, () => renderSongDocument(dom, state));
	const actions = {
		record: () => toggleSongRecording(state, dom),
		play: () => playSongDocument(state, dom),
		stop: () => stopSongTransport(state, dom),
		upload: () => chooseSongFile(dom),
		download: () => downloadMultitrackMix('wav'),
		downloadWebm: () => downloadMultitrackMix('webm'),
		downloadText: () => exportSongFile(state, dom),
		normalize: () => normalizeSongDocument(state, dom),
		remix: () => remixSongDocument(state, dom),
		restore: () => restoreRawSongDocument(state, dom)
	};
	for (const [name, action] of Object.entries(actions)) {
		dom.buttons.get(name)?.addEventListener('click', () => safeAction(action, dom, state));
	}
	dom.fileInput.addEventListener('change', () => safeAction(
		() => importSongFile(dom.fileInput.files?.[0], state, dom), dom, state));
}

/** Preserve errors rather than silently losing an export. */
async function safeAction(action, dom, state) {
	try { await action(); }
	catch (error) {
		state.setStatus(`Song Studio: ${error?.message || 'Unknown error'}`);
		dom.status.textContent = state.status;
	}
}
