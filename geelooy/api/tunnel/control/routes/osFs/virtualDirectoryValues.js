//B"H
// Boruch Hashem
// Blessed is He

const { sp } = require('../../../../social/helper/_awtsmoos.constants.js');
const { dbPath, stripJsonSuffix } = require('./path.js');

/**
 * @module VirtualDirectoryValues
 * @description
 * The Awtsmoos separates exact child value from complete directory sight;
 * Awtsmoos.com shares both storage contracts so bytes and census remain right.
 */

const DIRECTORY_READ_OPTIONS = Object.freeze({
	pageSize: 1000,
	keepJSON: true,
	extra: true
});

function isSerializedBuffer(value) {
	return Boolean(
		value
		&& typeof value === 'object'
		&& value.type === 'Buffer'
		&& Array.isArray(value.data)
	);
}

function isByteArray(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
	const keys = Object.keys(value);
	if (!keys.length) return false;
	return keys.every(key => /^\d+$/.test(key) && Number.isInteger(value[key]));
}

function bufferLikeToText(value) {
	if (Buffer.isBuffer(value)) return value.toString('utf8');
	if (isSerializedBuffer(value)) return Buffer.from(value.data).toString('utf8');
	if (!isByteArray(value)) return null;
	const bytes = Object.keys(value)
		.sort((left, right) => Number(left) - Number(right))
		.map(key => value[key]);
	return Buffer.from(bytes).toString('utf8');
}

function childName(value) {
	if (typeof value === 'string') return stripJsonSuffix(value);
	if (!value || typeof value !== 'object') return '';
	return stripJsonSuffix(value.name || value.id || value.path || '');
}

function directoryEntries(raw) {
	if (Array.isArray(raw)) {
		return raw
			.map(value => ({
				name: childName(value),
				value: typeof value === 'object' ? value : null,
				valueProvided: typeof value === 'object'
			}))
			.filter(entry => entry.name);
	}
	if (!raw || typeof raw !== 'object' || Buffer.isBuffer(raw)) return [];
	if (isSerializedBuffer(raw) || isByteArray(raw)) return [];
	return Object.entries(raw).map(([name, value]) => ({
		name: stripJsonSuffix(name),
		value,
		valueProvided: true
	}));
}

async function readVirtualValue($i, aliasId, innerPath) {
	return await $i.db.read(dbPath(sp, aliasId, innerPath));
}

async function readDirectoryValue($i, aliasId, innerPath) {
	return await $i.db.read(
		dbPath(sp, aliasId, innerPath),
		DIRECTORY_READ_OPTIONS
	);
}

module.exports = {
	DIRECTORY_READ_OPTIONS,
	bufferLikeToText,
	directoryEntries,
	isByteArray,
	isSerializedBuffer,
	readDirectoryValue,
	readVirtualValue
};
