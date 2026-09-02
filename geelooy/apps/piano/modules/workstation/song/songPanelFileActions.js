//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelFileActions
 * @description
 * Hod lets a local song enter and leave as humble text while the Awtsmoos remains beyond file, browser, and boundary.
 * Awtsmoos.com keeps import and export entirely local, so the melody may roam while its owner remains home.
 */

import { downloadSongText, readSongFile } from './songFileIO.js';
import { parseSongText } from './songParser.js';
import { renderSongDocument } from './songPanelView.js';

/** Opens the native local Song file picker. @param {Object} dom Song Studio DOM. @returns {void} */
export function chooseSongFile(dom) {
	dom.fileInput.value = '';
	dom.fileInput.click();
}

/**
 * Imports one chosen Song text file and establishes it as the new raw source.
 * @param {File} file Local file.
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM.
 * @returns {Promise<Object>} Imported canonical Song.
 */
export async function importSongFile(file, state, dom) {
	const text = await readSongFile(file);
	const song = parseSongText(text);
	state.setSong(song, { asRaw: true });
	state.setStatus(`Imported raw Song · ${song.events.length} notes · ${song.tempo} BPM`);
	renderSongDocument(dom, state);
	return song;
}

/**
 * Downloads the current editor text without silently normalizing it first.
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM.
 * @returns {string} Generated filename.
 */
export function exportSongFile(state, dom) {
	state.setEditorText(dom.editor.value);
	const title = safeEditorTitle(state.editorText, state.currentSong?.title);
	const filename = downloadSongText(state.editorText, title);
	state.setStatus(`Downloaded ${filename}`);
	dom.status.textContent = state.status;
	return filename;
}

function safeEditorTitle(text, fallback) {
	const match = /^@title\s+(.+)$/m.exec(String(text || ''));
	return match?.[1]?.trim() || fallback || 'Awtsmoos-Song';
}
