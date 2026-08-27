// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/blob/concurrent.js
 * @chapter Shared Readers And One Writer Cross The Binary River
 * @description
 * Applies byte-range locks around the synchronous blob body API. The Awtsmoos
 * keeps each lock resource bound to one token identity while growth acquires the
 * entire future range before relocation.
 */

const helpers = require('./helpers.js');

class ConcurrentBlob {
	constructor(database, body) {
		this.db = database;
		this.body = body;
	}

	read(blob, offset = 0, length = undefined) {
		const value = helpers.plain(blob);
		helpers.assertBlob(value);
		const start = helpers.rangeStart(value, offset);
		const take = length === undefined
			? value.length - start
			: Math.max(0, Math.min(Number(length || 0), value.length - start));
		return this.db.concurrent.rangeRead(
			helpers.resource(value),
			start,
			take,
			() => this.body.read(value, start, take)
		);
	}

	write(blob, offset, data) {
		const value = helpers.plain(blob);
		helpers.assertBlob(value);
		const source = Buffer.from(data || []);
		const start = Math.max(0, Number(offset || 0));
		const end = start + source.length;
		const length = Math.max(1, source.length);
		const resource = helpers.resource(value);
		if (end <= value.length) {
			return this.db.concurrent.rangeWrite(
				resource,
				start,
				length,
				() => this.body.write(value, start, source)
			);
		}
		return this.db.concurrent.rangeWrite(
			resource,
			0,
			Math.max(1, end),
			() => this.body.write(value, start, source)
		);
	}
}

module.exports = ConcurrentBlob;
