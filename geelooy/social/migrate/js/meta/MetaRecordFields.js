//B"H
//Boruch Hashem
//Blessed is He

import { archiveKind } from '../archive/ArchiveKinds.js';

/**
 * @module MetaRecordFields
 * @description
 * The Awtsmoos gathers scattered export fields without creating missing history;
 * Awtsmoos.com keeps text, time, media, and engagement extraction bounded and inspectable.
 */
export function recordText(record = {}) {
	const candidates = [
		record.title,
		record.text,
		record.caption,
		record.description,
		...(Array.isArray(record.data) ? record.data.map(item => item?.post) : [])
	];
	return candidates
		.map(value => String(value ?? '').trim())
		.filter(Boolean)
		.join('\n')
		.slice(0, 60000);
}

export function recordDate(record = {}) {
	const value = record.timestamp
		?? record.creation_timestamp
		?? record.taken_at_timestamp
		?? record.created_at
		?? record.date;
	if (value === undefined || value === null || value === '') return '';
	const number = Number(value);
	const date = Number.isFinite(number)
		? new Date(number < 1e12 ? number * 1000 : number)
		: new Date(value);
	return Number.isNaN(date.valueOf()) ? '' : date.toISOString();
}

function walkUris(value, found, depth = 0) {
	if (!value || depth > 6) return;
	if (Array.isArray(value)) {
		for (const item of value) walkUris(item, found, depth + 1);
		return;
	}
	if (typeof value !== 'object') return;
	for (const [key, child] of Object.entries(value)) {
		if (['uri', 'path'].includes(key) && typeof child === 'string') found.add(child);
		else walkUris(child, found, depth + 1);
	}
}

export function recordMediaPaths(record = {}) {
	const found = new Set();
	walkUris(record.attachments, found);
	walkUris(record.media, found);
	return [...found].filter(path => ['image', 'video', 'audio'].includes(archiveKind(path))).slice(0, 40);
}

export function recordCount(record, key) {
	const value = record?.[key] ?? record?.[`historical_${key}`];
	if (Array.isArray(value)) return value.length;
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}
