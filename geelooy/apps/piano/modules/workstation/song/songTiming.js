//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongTiming
 * @description
 * Gevurah snaps wandering time into a chosen grid while Chesed preserves the living durations between its stones.
 * Awtsmoos.com derives corrected takes without erasing the raw performance renewed by the Awtsmoos each instant.
 */

import { createSong } from './songModel.js';

/**
 * Creates a normalized copy with optional leading trim, quantization, and target tempo metadata.
 * @param {Object} song Source song.
 * @param {Object} options Timing choices.
 * @returns {Object} Derived canonical song.
 */
export function normalizeSongTiming(song, options = {}) {
	const grid = positive(options.grid, song.grid || 0.25);
	const targetTempo = positive(options.targetTempo, song.tempo || 120);
	const leadingOffset = options.trimLeading === false
		? 0
		: minimumStart(song.events || []);
	const events = (song.events || []).map((event) => normalizedEvent(event, grid, leadingOffset));
	const markers = (song.markers || []).map((marker) => ({
		...marker,
		beat: quantizeBeat(Math.max(0, marker.beat - leadingOffset), grid)
	}));
	return createSong({
		...song,
		title: options.title || `${song.title || 'Take'} · Normalized`,
		tempo: targetTempo,
		grid,
		events,
		markers
	});
}

/** Snaps a beat position to one positive grid. @param {number} value Beat value. @param {number} grid Grid size. @returns {number} Snapped beat. */
export function quantizeBeat(value, grid) {
	const safeGrid = positive(grid, 0.25);
	return Number((Math.round(Number(value) / safeGrid) * safeGrid).toFixed(6));
}

function normalizedEvent(event, grid, leadingOffset) {
	const start = quantizeBeat(Math.max(0, event.start - leadingOffset), grid);
	const duration = Math.max(grid, quantizeBeat(event.duration, grid));
	return { ...event, start, duration };
}

function minimumStart(events) {
	if (events.length === 0) {
		return 0;
	}
	return Math.min(...events.map((event) => event.start));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
