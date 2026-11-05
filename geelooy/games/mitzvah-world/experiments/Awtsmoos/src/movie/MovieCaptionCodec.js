// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCaptionCodec.js
 * @description Parses and serializes deterministic SRT and WebVTT caption text without browser or file dependencies.
 * The Awtsmoos is beyond timestamp and language while every finite utterance deserves portable witness;
 * Awtsmoos.com keeps import and export reversible, bounded, newline-safe, and ready for agent or human business.
 */

import { MovieApiError } from './MovieApiError.js';
import { normalizeMovieCaptionClip } from './MovieTextTrackContract.js';

export function parseMovieCaptions(source, options = {}) {
	const text = String(source || '').replace(/\r\n?/g, '\n').trim();
	if (!text) return [];
	const format = String(options.format || detectFormat(text));
	const body = format === 'vtt' ? text.replace(/^WEBVTT[^\n]*\n+/i, '') : text;
	return body.split(/\n{2,}/).map((block, index) => (
		parseCaptionBlock(block, index, options)
	)).filter(Boolean);
}

export function serializeMovieCaptions(clips, options = {}) {
	const format = String(options.format || 'srt').toLowerCase();
	const values = (Array.isArray(clips) ? clips : [])
		.map(clip => normalizeMovieCaptionClip(clip))
		.sort((left, right) => left.start - right.start || left.id.localeCompare(right.id));
	if (format === 'vtt') {
		return `WEBVTT\n\n${values.map((clip, index) => vttBlock(clip, index)).join('\n\n')}\n`;
	}
	if (format !== 'srt') {
		throw new MovieApiError('UNKNOWN_CAPTION_FORMAT', `Unknown caption format ${format}.`);
	}
	return `${values.map((clip, index) => srtBlock(clip, index)).join('\n\n')}\n`;
}

function parseCaptionBlock(block, index, options) {
	const lines = String(block).split('\n').map(line => line.trimEnd());
	if (!lines.some(Boolean)) return null;
	let cursor = 0;
	let id = '';
	if (!lines[cursor]?.includes('-->')) {
		id = lines[cursor]?.trim() || '';
		cursor += 1;
	}
	const timing = lines[cursor]?.match(/(.+?)\s+-->\s+(.+?)(?:\s+.*)?$/);
	if (!timing) {
		throw new MovieApiError('INVALID_CAPTION_TIMING', `Caption block ${index + 1} has no valid timing line.`);
	}
	const start = parseCaptionTime(timing[1]);
	const end = parseCaptionTime(timing[2]);
	if (end <= start) {
		throw new MovieApiError('INVALID_CAPTION_RANGE', `Caption block ${index + 1} must end after it starts.`);
	}
	return normalizeMovieCaptionClip({
		duration: end - start,
		id: id && !/^\d+$/.test(id) ? id : `caption-${index + 1}`,
		language: options.language,
		position: options.position,
		speaker: options.speaker,
		start,
		style: options.style,
		text: lines.slice(cursor + 1).join('\n').trim()
	});
}

export function parseCaptionTime(value) {
	const normalized = String(value).trim().replace(',', '.');
	const parts = normalized.split(':').map(Number);
	if (parts.some(number => !Number.isFinite(number)) || parts.length < 2 || parts.length > 3) {
		throw new MovieApiError('INVALID_CAPTION_TIME', `Invalid caption time ${value}.`);
	}
	const [hours, minutes, seconds] = parts.length === 3
		? parts
		: [0, parts[0], parts[1]];
	return Number((hours * 3600 + minutes * 60 + seconds).toFixed(3));
}

export function formatCaptionTime(value, separator = ',') {
	const milliseconds = Math.max(0, Math.round(Number(value || 0) * 1000));
	const hours = Math.floor(milliseconds / 3600000);
	const minutes = Math.floor(milliseconds % 3600000 / 60000);
	const seconds = Math.floor(milliseconds % 60000 / 1000);
	const remainder = milliseconds % 1000;
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${String(remainder).padStart(3, '0')}`;
}

function srtBlock(clip, index) {
	return `${index + 1}\n${formatCaptionTime(clip.start)} --> ${formatCaptionTime(clip.start + clip.duration)}\n${clip.text}`;
}

function vttBlock(clip, index) {
	return `${clip.id || `caption-${index + 1}`}\n${formatCaptionTime(clip.start, '.')} --> ${formatCaptionTime(clip.start + clip.duration, '.')}\n${clip.text}`;
}

function detectFormat(value) {
	return /^WEBVTT/i.test(value) ? 'vtt' : 'srt';
}

function pad(value) {
	return String(value).padStart(2, '0');
}
