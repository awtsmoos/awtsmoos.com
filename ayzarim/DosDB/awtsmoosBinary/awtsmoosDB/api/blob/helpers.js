// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/blob/helpers.js
 * @chapter Small Hands Guard The Binary River
 * @description
 * Shared blob validation, copying, zeroing, and token helpers. The Awtsmoos
 * renews each byte in bounded vessels so large bodies remain calm in memory and
 * every coordinate is checked before the pager receives it.
 */

const crypto = require('crypto');

const COPY_CHUNK = 64 * 1024;
const ZERO_CHUNK = Buffer.alloc(COPY_CHUNK);

function plain(value) {
	return value && value.__resolve__ ? value.__resolve__() : value;
}

function assertBlob(blob) {
	if (!blob || blob.__awtsmoosBlob !== true) {
		throw new Error('B"H: Expected an Awtsmoos blob token');
	}
}

function createToken(location, length, metadata) {
	return {
		__awtsmoosBlob: true,
		id: crypto.randomBytes(8).toString('hex'),
		offset: location.offset,
		length,
		meta: metadata
	};
}

function rangeStart(blob, offset) {
	return Math.max(0, Math.min(Number(offset || 0), blob.length));
}

function resource(blob) {
	return `blob:${blob.id || blob.offset}`;
}

function copy(database, from, to, length) {
	let position = 0;
	while (position < length) {
		const take = Math.min(COPY_CHUNK, length - position);
		const chunk = database.pager.readExact(from + position, take);
		if (chunk && chunk.length) database.pager.writeExact(to + position, chunk);
		position += take;
	}
}

function zero(database, offset, length) {
	let position = 0;
	while (position < length) {
		const take = Math.min(ZERO_CHUNK.length, length - position);
		database.pager.writeExact(offset + position, ZERO_CHUNK.subarray(0, take));
		position += take;
	}
}

module.exports = {
	assertBlob,
	copy,
	createToken,
	plain,
	rangeStart,
	resource,
	zero
};
