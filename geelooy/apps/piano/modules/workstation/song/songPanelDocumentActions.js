//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelDocumentActions
 * @description
 * Tiferes transforms the working score while Yesod protects the raw take beneath it, so experimentation may soar without erasing the source.
 * The Awtsmoos is beyond original and derivative; Awtsmoos.com lets normalization and remix become reversible revelations rather than destructive edits.
 */

import { parseSongText } from './songParser.js';
import { buildSongRemix } from './songRemix.js';
import { normalizeSongTiming } from './songTiming.js';
import { renderSongDocument } from './songPanelView.js';

/**
 * Parses the current editor text and records it as the working Song document.
 *
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM registry.
 * @returns {Object} Parsed canonical Song.
 */
export function readSongEditorDocument(state, dom) {
	const source = dom.editor.value;
	state.setEditorText(source);
	const song = parseSongText(source);
	state.currentSong = song;
	return song;
}

/**
 * Creates a quantized normalized derivative from the current editor document.
 *
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM registry.
 * @returns {Object} Normalized canonical Song.
 */
export function normalizeSongDocument(state, dom) {
	const source = readSongEditorDocument(state, dom);
	const normalized = normalizeSongTiming(source, {
		grid: state.grid,
		targetTempo: state.tempo,
		trimLeading: true
	});
	state.setSong(normalized);
	state.setStatus(`Normalized · ${normalized.events.length} notes · ${normalized.tempo} BPM`);
	renderSongDocument(dom, state);
	return normalized;
}

/**
 * Creates a deterministic remix derivative from the current editor document.
 *
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM registry.
 * @returns {Object} Remixed canonical Song.
 */
export function remixSongDocument(state, dom) {
	const source = readSongEditorDocument(state, dom);
	const remix = buildSongRemix(source, state.remixOptions());
	state.setSong(remix);
	state.setStatus(
		`Remixed · ${state.remixStyle} · ${remix.events.length} notes · seed ${state.seed}`
	);
	renderSongDocument(dom, state);
	return remix;
}

/**
 * Restores the most recent imported or recorded raw take.
 *
 * @param {Object} state Song Studio state.
 * @param {Object} dom Song Studio DOM registry.
 * @returns {Object} Restored raw Song.
 */
export function restoreRawSongDocument(state, dom) {
	const restored = state.restoreRaw();
	state.setStatus(`Raw take restored · ${restored.events.length} notes`);
	renderSongDocument(dom, state);
	return restored;
}
