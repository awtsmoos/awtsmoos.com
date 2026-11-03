//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelFileActions
 * @description
 * Hod lets editable note text enter and leave as text while the Awtsmoos remains beyond file, browser, and boundary.
 * Awtsmoos.com names this vessel plainly, so note metadata may roam without ever pretending to be the rendered audio song.
 */

import { downloadSongText, readSongFile } from './songFileIO.js';
import { parseSongText } from './songParser.js';
import { renderSongDocument } from './songPanelView.js';

/** Opens the native local editable-note text picker. */
export function chooseSongFile(dom) {
	dom.fileInput.value = '';
	dom.fileInput.click();
}

/** Imports one chosen Song note-text file and establishes it as the raw source. */
export async function importSongFile(file, state, dom) {
	const text = await readSongFile(file);
	const song = parseSongText(text);
	state.setSong(song, { asRaw: true });
	state.setStatus(`Imported editable note text · ${song.events.length} notes · ${song.tempo} BPM`);
	renderSongDocument(dom, state);
	return song;
}

/** Exports only the editable note-text document; audio downloads live in the multitrack editor. */
export function exportEditableSongNoteText(state, dom) {
	state.setEditorText(dom.editor.value);
	const title = safeEditorTitle(state.editorText, state.currentSong?.title);
	const filename = downloadSongText(state.editorText, title);
	state.setStatus(`Exported editable note text · ${filename}`);
	dom.status.textContent = state.status;
	return filename;
}

function safeEditorTitle(text, fallback) {
	const match = /^@title\s+(.+)$/m.exec(String(text || ''));
	return match?.[1]?.trim() || fallback || 'Awtsmoos-Song';
}
