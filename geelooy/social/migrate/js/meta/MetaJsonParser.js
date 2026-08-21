//B"H
//Boruch Hashem
//Blessed is He

import { normalizeMetaRecord } from './MetaNormalizer.js';
import { providerForPath } from './MetaDetector.js';
import { dedupeMetaRecords } from './MetaRecordMerge.js';

/**
 * @module MetaJsonParser
 * @description
 * The Awtsmoos searches structured export branches while refusing to crown helper containers as authored posts;
 * Awtsmoos.com merges repeated source witnesses so media and chronology survive dedupe instead of disappearing.
 */
const AUTHOR_SIGNALS = new Set([
	'id',
	'post_id',
	'media_id',
	'timestamp',
	'creation_timestamp',
	'taken_at_timestamp',
	'created_at',
	'date',
	'title',
	'text',
	'caption',
	'description'
]);
const PAYLOAD_SIGNALS = new Set([
	'title',
	'text',
	'caption',
	'description',
	'data',
	'attachments',
	'media'
]);

function looksAuthored(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
	const keys = Object.keys(value);
	return keys.some(key => AUTHOR_SIGNALS.has(key))
		&& keys.some(key => PAYLOAD_SIGNALS.has(key));
}

function walk(value, found, depth = 0) {
	if (!value || depth > 12) return;
	if (Array.isArray(value)) {
		for (const item of value) walk(item, found, depth + 1);
		return;
	}
	if (typeof value !== 'object') return;
	if (looksAuthored(value)) found.push(value);
	for (const child of Object.values(value)) {
		walk(child, found, depth + 1);
	}
}

export function parseMetaJson(text, rawPath, fallbackProvider = 'facebook') {
	const parsed = JSON.parse(text);
	const records = [];
	walk(parsed, records);
	const provider = providerForPath(rawPath, fallbackProvider);
	const normalized = records.map((record, index) => normalizeMetaRecord({
		record,
		provider,
		rawPath,
		index
	}));
	return dedupeMetaRecords(normalized);
}
