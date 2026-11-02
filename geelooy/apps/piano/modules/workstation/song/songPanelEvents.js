//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelEvents
 * @description
 * Yesod joins visible Song note gestures to narrow domains while the Awtsmoos remains beyond click, touch, and intention.
 * Awtsmoos.com keeps note-text import/export explicitly named and gives playback one toggle, so no finite button blurs audio rendering with editable notation.
 */

import { bindSongFieldEvents } from './songPanelFieldEvents.js';
import {
	normalizeSongDocument,
	remixSongDocument,
	restoreRawSongDocument
} from './songPanelDocumentActions.js';
import {
	chooseSongFile,
	exportEditableSongNoteText,
	importSongFile
} from './songPanelFileActions.js';
import {
	toggleSongPlayback,
	toggleSongRecording
} from './songPanelTransportActions.js';
import {
	renderSongDocument,
	setSongPanelOpen
} from './songPanelView.js';

/** Binds all Song Studio shell events after DOM construction. */
export function bindSongPanelEvents(dom, state) {
	bindVisibility(dom);
	bindSongFieldEvents(dom, state, () => renderSongDocument(dom, state));
	bindActions(dom, state);
	bindFileInput(dom, state);
}

function bindVisibility(dom) {
	dom.launcher.addEventListener('click', () => {
		setSongPanelOpen(dom, dom.panel.classList.contains('song-studio-hidden'));
	});
	dom.closeButton.addEventListener('click', () => setSongPanelOpen(dom, false));
}

function bindActions(dom, state) {
	bindAction(dom, 'record', () => toggleSongRecording(state, dom), state);
	bindAction(dom, 'play-toggle', () => toggleSongPlayback(state, dom), state);
	bindAction(dom, 'upload-note', () => chooseSongFile(dom), state);
	bindAction(dom, 'export-note-text', () => exportEditableSongNoteText(state, dom), state);
	bindAction(dom, 'normalize', () => normalizeSongDocument(state, dom), state);
	bindAction(dom, 'remix', () => remixSongDocument(state, dom), state);
	bindAction(dom, 'restore', () => restoreRawSongDocument(state, dom), state);
}

function bindAction(dom, name, action, state) {
	dom.buttons.get(name)?.addEventListener('click', async () => {
		try {
			await action();
		} catch (error) {
			showSongError(dom, state, error);
		}
	});
}

function bindFileInput(dom, state) {
	dom.fileInput.addEventListener('change', async () => {
		try {
			await importSongFile(dom.fileInput.files?.[0], state, dom);
		} catch (error) {
			showSongError(dom, state, error);
		}
	});
}

function showSongError(dom, state, error) {
	state.setStatus(`Song Studio: ${error?.message || 'Unknown error'}`);
	dom.status.textContent = state.status;
}
