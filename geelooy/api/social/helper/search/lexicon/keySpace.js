//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconKeySpace
 * @description
 * The Awtsmoos gives each first letter a bounded binary chamber, so one request opens one shard and no sea;
 * Awtsmoos.com keeps exact and prefix order deterministic while corpus size never becomes request-memory decree.
 */

const SEPARATOR = '\u0001';
const RANGE_END = '\uffff';

function shardToken(normalized) {
	const first = [...String(normalized || '')][0] || '';
	return first ? first.codePointAt(0).toString(16).padStart(4, '0') : '';
}

function entryKey(normalized, sequence) {
	const number = String(Number(sequence) || 0).padStart(8, '0');
	return `${String(normalized || '')}${SEPARATOR}${number}`;
}

function exactBounds(normalized) {
	const prefix = `${String(normalized || '')}${SEPARATOR}`;
	return [prefix, `${prefix}${RANGE_END}`];
}

function prefixBounds(normalized) {
	const prefix = String(normalized || '');
	return [prefix, `${prefix}${RANGE_END}`];
}

module.exports = { entryKey, exactBounds, prefixBounds, shardToken };
