//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongParser
 * @description
 * Binah reads a plain-text melody and hears ordered measures inside humble lines.
 * The Awtsmoos precedes letter and sound while Awtsmoos.com keeps the grammar human enough to edit without a sequencer.
 */

import {
	DEFAULT_BEATS_PER_BAR,
	DEFAULT_GRID,
	DEFAULT_TEMPO,
	createSong,
	normalizeSongEvent
} from './songModel.js';

/** Parses Awtsmoos Song text into one canonical song. @param {string} source Human-readable score. @returns {Object} Parsed song. */
export function parseSongText(source) {
	const draft = {
		title: 'Imported Song',
		tempo: DEFAULT_TEMPO,
		beatsPerBar: DEFAULT_BEATS_PER_BAR,
		grid: DEFAULT_GRID,
		events: [],
		markers: []
	};
	String(source || '').split(/\r?\n/).forEach((rawLine, index) => {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) {
			return;
		}
		try {
			parseLine(line, draft);
		} catch (error) {
			throw new Error(`Line ${index + 1}: ${error.message}`);
		}
	});
	return createSong(draft);
}

function parseLine(line, draft) {
	if (line.startsWith('@')) {
		parseDirective(line, draft);
		return;
	}
	if (line.startsWith('!')) {
		parseMarker(line, draft);
		return;
	}
	parseNote(line, draft);
}

function parseNote(line, draft) {
	const fields = line.split(/\s+/);
	if (fields.length < 3 || fields.length > 4) {
		throw new Error('Expected: startBeat durationBeat note [velocity]');
	}
	const [start, duration, note, velocity = '0.82'] = fields;
	draft.events.push(normalizeSongEvent({ start, duration, note, velocity }));
}

function parseDirective(line, draft) {
	const match = /^@(\S+)\s+(.+)$/.exec(line);
	if (!match) {
		throw new Error('Directive requires a value');
	}
	const [, rawKey, rawValue] = match;
	const key = rawKey.toLowerCase();
	if (key === 'title') {
		draft.title = rawValue.trim();
		return;
	}
	const field = directiveField(key);
	if (!field) {
		throw new Error(`Unknown directive @${rawKey}`);
	}
	const number = Number(rawValue);
	if (!Number.isFinite(number) || number <= 0) {
		throw new Error(`@${rawKey} must be a positive number`);
	}
	draft[field] = number;
}

function directiveField(key) {
	return {
		tempo: 'tempo',
		beatsperbar: 'beatsPerBar',
		grid: 'grid'
	}[key] || '';
}

function parseMarker(line, draft) {
	const match = /^!\s*([0-9.]+)\s+(.+)$/.exec(line);
	if (!match) {
		throw new Error('Marker requires: ! beat LABEL');
	}
	const beat = Number(match[1]);
	if (!Number.isFinite(beat) || beat < 0) {
		throw new Error('Marker beat must be nonnegative');
	}
	draft.markers.push({ beat, label: match[2].trim() });
}
